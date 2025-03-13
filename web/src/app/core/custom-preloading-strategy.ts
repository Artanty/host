// src/app/custom-preloading-strategy.ts
import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route, Router, Routes } from '@angular/router';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root', // Provide the service in the root injector
})
export class CustomPreloadingStrategy implements PreloadingStrategy {

  private loadedModules = new Map<string, any>(); // Track loaded modules

  constructor(private router: Router) {}

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    console.log('preload')
    console.log(route)
    if (route.data && route.data['preload']) {
      return load().pipe(
        tap((module) => {
          console.log(module)
          console.log(route.path)
          // Store the loaded module for later unloading
          if (route.path) {
            this.loadedModules.set(route.path, module);
          }
        }),
      );
    } else {
      return of(null); // Do not preload
    }
  }

  // Unload a module by its route path
  unloadModule(path: string): void {
    console.log( 12)
    const module = this.loadedModules.get(path);
    if (module) {
      // Clean up the module (if needed)
      if (module.destroy) {
        module.destroy(); // Call a cleanup method if it exists
      } else {
        console.log('no module.destroy()')
      }

      // Remove the module from the router configuration
      const routes = this.router.config.filter((route) => route.path !== path);
      console.log( routes)
      this.router.resetConfig(routes);

      // Remove the module from the tracking map
      this.loadedModules.delete(path);
    } else {
      console.log('no module in loadedModules')
    }
  }

  // Refresh a module by unloading and reloading it
  refreshModule(path: string): void {
    this.unloadModule(path);

    // Reload the module by re-adding its route
    const route = this.router.config.find((r) => r.path === path);
    if (route) {
      this.router.resetConfig([...this.router.config, route]);
      this.preload(route, () => route.loadChildren!() as Observable<any>).subscribe();
    }
  }
}