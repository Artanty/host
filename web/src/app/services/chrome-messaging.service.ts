/// <reference types="@types/firefox-webext-browser" />

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CoreService } from './core.service';
import { BusEvent } from 'typlib';

declare const safari: any;


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

interface BrowserAPI {
  type: 'chrome' | 'firefox' | 'safari';
  runtime?: {
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
    };
  };
  extension?: any;
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

  private getBrowserAPI(): BrowserAPI | null {
    const global = window as any;
  
    if (global.chrome?.runtime?.onMessage) {
      return {
        type: 'chrome',
        runtime: global.chrome.runtime
      };
    } else if (global.browser?.runtime?.onMessage) {
      return {
        type: 'firefox',
        runtime: global.browser.runtime
      };
    } else if (global.safari?.extension) {
      return {
        type: 'safari',
        extension: global.safari.extension
      };
    }
    return null;
  }
  // // Listen for messages from background.js
  // private _listenForMessages() {
  //   if (chrome && chrome?.runtime && chrome?.runtime.onMessage) {
  //     chrome?.runtime.onMessage.addListener((
  //       message: MyMessage, 
  //       sender: chrome.runtime.MessageSender, 
  //       sendResponse: (response?: any) => void
  //     ) => {
  //       this._messageSubject.next(message);
  //       console.log('HOST received message: ')
  //       console.log(message)
  //       sendResponse(true);
  //     });
  //   } else {
  //     console.warn('chrome.runtime.onMessage is not available.');
  //   }
  // }
  private _listenForMessages() {
    const browserAPI = this.getBrowserAPI();
  
    if (!browserAPI) {
      console.warn('No browser extension API available');
      return;
    }

    if (browserAPI.runtime?.onMessage) {
      // Chrome or Firefox
      browserAPI.runtime.onMessage.addListener((
        message: MyMessage,
        sender: any,
        sendResponse: (response?: any) => void
      ) => {
        this._messageSubject.next(message);
        console.log(`HOST received message in ${browserAPI.type}: `, message);
        sendResponse(true);
      });
    } else if (browserAPI.extension) {
      // Safari
      browserAPI.extension.addEventListener('message', (event: any) => {
        this._messageSubject.next(event.message);
        console.log('HOST received message in Safari: ', event.message);
      });
    }
  }
  private _setupSafariMessaging() {
    safari.extension.addEventListener('message', (event: any) => {
      this._messageSubject.next(event.message);
      console.log('HOST received Safari message: ', event.message);
    });
  }

  public triggerShowTicketTry() {
    this._messageSubject.next(busEvent);
  }
}