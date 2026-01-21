import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER } from 'typlib';
import { filterOutSseEvents } from '../../utilites/filterOutSseEvents';

@Component({
  selector: 'app-scaffold',
  templateUrl: './scaffold.component.html',
  styleUrl: './scaffold.component.scss',
  providers: [
    {
      provide: EVENT_BUS_LISTENER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
      },
      deps: [EVENT_BUS],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
}) 
export class ScaffoldComponent {

  public items$: BehaviorSubject<BusEvent[]> = new BehaviorSubject<BusEvent[]>([])
  
  constructor(
    @Inject(EVENT_BUS_LISTENER)
    private readonly eventBusListener$: Observable<BusEvent>,
  ) {
    /**
     * Если поместить в OnInit - теряется порядок
     */
    this.eventBusListener$.pipe(
      filter(filterOutSseEvents)
    ).subscribe(res => {
      this.items$.next([res, ...this.items$.getValue()])
    })
  }
}
