// src/app/custom-preloading-strategy.ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root', // Provide the service in the root injector
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      return load(); // Preload the route
    } else {
      return of(null); // Do not preload
    }
  }
}