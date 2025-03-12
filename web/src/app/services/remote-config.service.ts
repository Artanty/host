import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { filter, firstValueFrom, forkJoin, Observable, of, switchMap, take } from "rxjs";
import { RemoteBody, Remotes } from "../app.component.types";
import { EVENT_BUS_LISTENER, BusEvent, EVENT_BUS, EVENT_BUS_PUSHER } from "typlib";

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

    public setRemotesConfigs (remotes: Remotes): Promise<any[]> {
        const arrOfObs$ = Object.entries(remotes)
        .map(([projectId, _]: [string, RemoteBody]) => projectId)
        .map(projectId => this.setRemoteConfig(remotes, projectId))
        
        return firstValueFrom(forkJoin(arrOfObs$))
    }

    public setRemoteConfig (remotes: Remotes, projectId: string): Observable<any> {
        return this.getRemoteConfig(remotes, projectId)
        .pipe(
            switchMap((res: any) => {
                if (res['event_bus_hooks']) {
                    res['event_bus_hooks'].forEach((el: any) => {
                        this._createEventHook(projectId, el.trigger, el.action, el.lives)
                    })
                }
                return of(1)
            })
        )
    }

    _createEventHook (projectId: string, trigger: any, action: string, lives: string) {
        let obs$ = this.eventBusListener$
        .pipe(
            filter((res: BusEvent) => {
                if (trigger.event) {
                    const eventCondition = (res: BusEvent) => res.event === trigger.event
                    return eventCondition(res)
                }
                return false
            })
        )

        if (lives === 'once') {
            obs$ = obs$.pipe(take(1))
        }
        obs$.subscribe(_ => {
            this._pushBusEvent(projectId, action)
        })
    }

    _pushBusEvent (projectId: string, action: string): void {
        const busEvent: BusEvent = {
            from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
            to: `${projectId}@web`,
            event: 'TRIGGER_ACTION',
            payload: { action: action },
        };
        this.eventBusPusher(busEvent)
    }


    /**
     * 
     * @param remotes todo validate config
     * @param projectId 
     * @returns 
     */
    getRemoteConfig(remotes: Remotes, projectId: string): Observable<any> {
        return this.http.get(`${remotes[projectId].url}/assets/configs/remote.json`);
    }

    
    
}