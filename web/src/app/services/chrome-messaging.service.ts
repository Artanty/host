// src/app/services/chrome-messaging.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CoreService } from './core.service';
import { BusEvent } from 'typlib';
interface MyMessage {
  action: string;
  data: { key: string };
}

const busEvent: BusEvent = {
  from: 'ext-service-worker',
  to: 'faq',
  event: 'SHOW_OLDEST_TICKET',
  payload: {
    tickets: []
  }
}

@Injectable({
  providedIn: 'root',
})
export class ChromeMessagingService {
  private _messageSubject = new Subject<any>();

  constructor(
    private _coreService: CoreService
  ) {
    this._listenForMessages();
  }

  // Expose the message as an observable
  public get messages() {
    return this._messageSubject.asObservable();
  }

   // Listen for messages from background.js
   private _listenForMessages() {
    if (chrome && chrome?.runtime && chrome?.runtime.onMessage) {
      chrome?.runtime.onMessage.addListener((
        message: MyMessage, 
        sender: chrome.runtime.MessageSender, 
        sendResponse: (response?: any) => void
      ) => {
        this._messageSubject.next(message);
        console.log('HOST received message: ' )
        console.log(message)
        sendResponse(true);
      });
    } else {
      console.warn('chrome.runtime.onMessage is not available.');
      // if ( this._coreService.isDev()) {
      //   setInterval(() => {
      //     this._messageSubject.next(busEvent);
      //   }, 1000 * 60)
      // }
    }
  }

  public triggerShowTicketTry () {
    this._messageSubject.next(busEvent);
  }
}