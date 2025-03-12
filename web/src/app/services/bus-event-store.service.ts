import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { BusEvent, EVENT_BUS_PUSHER } from "typlib";

@Injectable({
    providedIn: 'root'
})

export class BusEventStoreService {
  private busEvents: BusEvent[] = [];
  private eventsSubject = new BehaviorSubject<BusEvent[]>(this.busEvents);

  // Observable to subscribe to for real-time updates
  events$ = this.eventsSubject.asObservable();

  constructor() {}

  public async addEvent(newEvent: BusEvent): Promise<void> {
    // Check if the event already exists (JSON.stringify comparison)
    const isDuplicate = this.busEvents.some(
      (event) => JSON.stringify(event) === JSON.stringify(newEvent)
    );

    if (isDuplicate) {
      console.log('Duplicate event detected. Not adding.');
      return Promise.resolve()
    }

  //   // Check if the event is "REGISTER_COMPONENTS" and matches the conditions
  //   if (
  //     newEvent.event === 'REGISTER_COMPONENTS' &&
  //     newEvent.from &&
  //     newEvent.payload.componentType &&
  //     newEvent.payload.customElementName &&
  //     newEvent.payload.customElementName
  //   ) {
  //     const existingEventIndex = this.busEvents.findIndex(
  //       (event) =>
  //         event.event === 'REGISTER_COMPONENTS' &&
  //         event.from === newEvent.from &&
  //         event.payload.componentType === newEvent.payload.componentType &&
  //         event.payload.customElementName === newEvent.payload.customElementName
  //     );

  //     // If a matching event is found, overwrite it
  //     if (existingEventIndex !== -1) {
  //       this.busEvents[existingEventIndex] = newEvent;
  //       console.log('Event overwritten:', newEvent);
  //     } else {
  //       // Otherwise, add the new event
  //       this.busEvents.push(newEvent);
  //       console.log('New event added:', newEvent);
  //     } 
  //   } else {
  //     // For other events, simply add them
  //     this.busEvents.push(newEvent);
  //     console.log('New event added:', newEvent);
  //   }
    this.busEvents.push(newEvent);
    // Notify subscribers
    this.eventsSubject.next(this.busEvents);
    
    return Promise.resolve()
  }

  // Get all bus events
  getAllEvents(): BusEvent[] {
    return this.busEvents;
  }

  // Clear all bus events
  clearEvents(): void {
    this.busEvents = [];
    this.eventsSubject.next(this.busEvents); // Notify subscribers
    console.log('Events cleared.');
  }

  // Find events by type (e.g., "REGISTER_COMPONENT")
  findEventsByType(eventType: string): BusEvent[] {
    return this.busEvents.filter((event) => event.event === eventType);
  }

  getEventsByProps(
    event: string,
    from: string,
    payloadFilter: Partial<BusEvent['payload']>
  ): BusEvent[] {
    if (!payloadFilter) return [];
    
    return this.busEvents.filter((busEvent) => {
      const matchesEventAndFrom =
        busEvent.event === event && busEvent.from === from;
      // console.log('matchesEventAndFrom: ' + matchesEventAndFrom)
      // console.log('event: ' + event)
      // console.log('from: ' + from) 
      // Check if the payload properties match
      const matchesPayload = Object.keys(payloadFilter).every(
        (key) =>
          busEvent.payload[key as keyof BusEvent['payload']] ===
          payloadFilter[key] // as keyof BusEvent['payload']
      );

      // Return true only if both conditions are met
      return matchesEventAndFrom && matchesPayload;
    });
  }

}