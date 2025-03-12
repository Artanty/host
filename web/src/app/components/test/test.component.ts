import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, filter, Observable, Subject, takeUntil } from 'rxjs';
import { EVENT_BUS_LISTENER, BusEvent, EVENT_BUS, EVENT_BUS_PUSHER } from 'typlib';

@Component({
  selector: 'app-test',
  template: `
    <p>
      test works!
    </p>
  `,
  styles: ``,
  providers: [
      {
        provide: EVENT_BUS_LISTENER,
        useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
          return eventBus$
            .asObservable()
            // .pipe(filter((res) => res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`));
        },
        deps: [EVENT_BUS],
      },
      {
        provide: EVENT_BUS_PUSHER,
        useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
          return (busEvent: BusEvent) => {
            eventBus$.next(busEvent);
          };
        },
        deps: [EVENT_BUS],
      },
    ],
})
export class TestComponent implements OnInit, OnDestroy {
  destroyed = new Subject<void>()
  constructor(
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
    @Inject(EVENT_BUS_PUSHER)
    private eventBusPusher: (busEvent: BusEvent) => void,
    // private _statService: StatService,
    // private renderer: Renderer2, 
    // private functionQueueService: FunctionQueueService,
    // private _busEventStoreService: BusEventStoreService,
    // private cdr: ChangeDetectorRef,
  ) {
    this.eventBusListener$.pipe(
      takeUntil(this.destroyed)
    ).subscribe((res: BusEvent) => {
      console.log('TEST COMP BUS event: ' + res.event)
      if (res.event === "CLOSE_EXT") {
        window.close();
      }
    })
  }

  ngOnInit(): void {
    // combineLatest([
    //   this._routerPathSet$(),
    //   this._registerComponentsService.listenComponentsRegistered$().pipe(
    //     filter((res: boolean) => res === true)
    //   )
    // ]).pipe(
    //   takeUntil(this.destroyed)
    // ).subscribe(() => {
    //   this._renderComponents()
    // })
  }

  ngOnDestroy (): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
