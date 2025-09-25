// services/route-tracker.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteTrackerService {

  constructor(private router: Router) {}

  init(): void {
    // Restore previous route
    const savedRoute = sessionStorage.getItem('current_route');
    if (savedRoute && savedRoute !== '/') {
      setTimeout(() => {
        this.router.navigateByUrl(savedRoute);
      }, 3000);
    }

    // Track new routes
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url !== '/') {
          if (!event.url.startsWith('/au')) {
            sessionStorage.setItem('current_route', event.url);  
          }
          
        }
      });
  }
}