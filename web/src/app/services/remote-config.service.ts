import { HttpClient, HttpInterceptorFn } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { catchError, concatMap, EMPTY, filter, finalize, firstValueFrom, forkJoin, Observable, of, switchMap, take, tap } from "rxjs";
import { InterceptorConfig, InterceptorConfigModification, RemoteBody, Remotes } from "../app.component.types";
import { EVENT_BUS_LISTENER, BusEvent, EVENT_BUS, EVENT_BUS_PUSHER } from "typlib";
import { dd } from "../utilites/dd";

export interface PushEvent {
    type: string,
    event?: string,
    action?: string,
    payload?: any
}
@Injectable({
    providedIn: 'root'
})
export class RemoteConfigService {
    private _remoteConfigs: Record<string, any> = {}
    private _interceptors: Map<string, InterceptorConfig> = new Map();

    constructor(
        private http: HttpClient,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        @Inject(EVENT_BUS_PUSHER)
        private eventBusPusher: (busEvent: BusEvent) => void,
    ) {}

    public getInterceptors(): InterceptorConfig[] {
        return Array.from(this._interceptors.values());
    }

    public setRemotesConfigs(remotes: Remotes): Promise<any[]> {

        this._remoteConfigs = remotes;
        const arrOfObs$ = Object.keys(remotes)
            .map(projectId => this.setRemoteConfig(remotes, projectId))
        
        return firstValueFrom(forkJoin(arrOfObs$))
    }

    public getRemoteRouterPath(remoteId: string): string {
        return this._remoteConfigs[remoteId].routerPath
    }

    public setRemoteConfig(remotes: Remotes, projectId: string): Observable<any> {
        return this._loadRemoteConfig(remotes, projectId)
            .pipe(
                switchMap((res: any) => {
                    if (res['event_bus_hooks'] && Array.isArray(res['event_bus_hooks']) && res['event_bus_hooks'].length) {
                        res['event_bus_hooks'].forEach((el: any) => {
                            // dd(el)
                            this._createEventHook(
                                projectId, 
                                el.on, 
                                el.push, 
                                el.lives
                            )
                        })
                    }
                    if (res['interceptors'] && Array.isArray(res['interceptors']) && res['interceptors'].length) {
                        res['interceptors'].forEach(interceptorConfig => {
                            this._registerInterceptor(projectId, interceptorConfig);    
                        })
                    }
                    return of(`${projectId}'s switchMap returns this to trigger forkJoin`)
                }),
                catchError(err => {
                    return of(`Error: ${projectId}'s err: ${err.message}`)
                    // throw new Error(`[${projectId.toUpperCase()}]: ${err.message}`)
                })
            )
    }

    private _registerInterceptor(projectId: string, config: InterceptorConfig): void {
        
        this._interceptors.set(projectId, config);
    }

    private _createEventHook(
        projectId: string, 
        on: any, 
        push: PushEvent, 
        lives: string
    ): void {
        let obs$ = this.eventBusListener$
            .pipe(
                filter((res: BusEvent) => {
                    if (on.event) {
                        const eventCondition = (res: BusEvent) => res.event === on.event
                        return eventCondition(res)
                    }
                    return false
                })
            )

        if (lives === 'once') {
            obs$ = obs$.pipe(take(1))
        }
        obs$.subscribe((res: BusEvent) => {
            
            this._pushBusEvent(projectId, push, res)
        })
    }

    private _pushBusEvent(projectId: string, push: PushEvent, on: BusEvent): void {
        let busEvent: BusEvent
        switch (push.type) {
            case 'TRIGGER_ACTION':
                busEvent = {
                    from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
                    to: `${projectId}@web`,
                    event: push.type,
                    payload: { action: push.action, payload: push.payload },
                };
                break;
            case 'ANSWER': 
                busEvent = {
                    from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
                    to: `${on.from}`,
                    event: on.event.replace('ASK_', ''),
                    payload: push.payload,
                };
                break;
            default:
                throw new Error('UNKNOWN EVENT')
        }
      
        
        this.eventBusPusher(busEvent)
    }

    /**
     * 
     * @param remotes todo validate config
     * @param projectId 
     * @returns 
     */
    private _loadRemoteConfig(remotes: Remotes, projectId: string): Observable<any> {
        return this.http.get(`${remotes[projectId].url}/assets/configs/remote.json`)
            .pipe(
                // tap(res => dd(res)),
                catchError((err: any) => {
                    console.log(err)
                    return of(`${projectId}'s http catchError returns this to trigger forkJoin`)
                    //todo interceptors check on refresh remote
                }) 
            );
    }   
}