import { Component, Inject, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER } from 'typlib';

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
  ]
})
export class ScaffoldComponent {

  public items$: BehaviorSubject<BusEvent[]> = new BehaviorSubject<BusEvent[]>([])
  
  constructor (
    @Inject(EVENT_BUS_LISTENER)
        private readonly eventBusListener$: Observable<BusEvent>,
  ) {
    /**
     * Если поместить в OnInit - теряется порядок
     */
    this.eventBusListener$.subscribe(res => {
      this.items$.next([...this.items$.getValue(), res])
    })
  }
}
