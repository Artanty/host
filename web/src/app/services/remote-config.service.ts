import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { catchError, concatMap, EMPTY, filter, finalize, firstValueFrom, forkJoin, Observable, of, switchMap, take, tap } from "rxjs";
import { RemoteBody, Remotes } from "../app.component.types";
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
    constructor(
        private http: HttpClient,
        @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
        @Inject(EVENT_BUS_PUSHER)
        private eventBusPusher: (busEvent: BusEvent) => void,
    ) {}

    public setRemotesConfigs(remotes: Remotes): Promise<any[]> {

        const arrOfObs$ = Object.keys(remotes)
            .map(projectId => this._setRemoteConfig(remotes, projectId))
        
        return firstValueFrom(forkJoin(arrOfObs$))
    }

    private _setRemoteConfig(remotes: Remotes, projectId: string): Observable<any> {
        return this._loadRemoteConfig(remotes, projectId)
            .pipe(
                switchMap((res: any) => {
                    if (res['event_bus_hooks']) {
                        res['event_bus_hooks'].forEach((el: any) => {
                            dd(el)
                            this._createEventHook(
                                projectId, 
                                el.on, 
                                el.push, 
                                el.lives
                            )
                        })
                    }
                    return of(`${projectId}'s switchMap returns this to trigger forkJoin`)
                }),
            
            )
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
                    payload: { action: push.action },
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
                tap(res => dd(res)),
                catchError(() => of(`${projectId}'s http catchError returns this to trigger forkJoin`)) 
            );
    }   
}