import { Router, Routes } from "@angular/router";
import { ProductButton, Remotes } from "../app.component.types";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { renderProductMainButton } from "./renderAppsButtons";
import { CustomPreloadingStrategy } from "../core/custom-preloading-strategy";
import { Observable } from "rxjs";

export async function loadModule(
    projectId: string, 
    remotes: Remotes, 
    router: Router,
    buttonsArr: ProductButton[]
): Promise<void> {
    
    const childRoutes: Routes = [
      {
        path: remotes[projectId as keyof typeof remotes].routerPath,
        loadChildren: () => {
          return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript)
          .then((m) => {
            const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName!]
            
            return remoteModule
          })
        },
        data: { 
          preload: true //remotes[projectId as keyof typeof remotes].routerPath === 'au' 
        }
      },
    ];
    router.resetConfig([...router.config, ...childRoutes]);
    
    // this._sendRoutePathToRemoteMfe(projectId)
    // this._remoteConfigService.setRemoteConfig(remotes, projectId)
    
    // this._renderProductMainButton(projectId)
    renderProductMainButton(projectId, remotes, buttonsArr)

    // preloadRoutes(childRoutes, preloadStrategy)
}

export async function loadRemotes (
    remotes: Remotes, 
    router: Router,
    currentRouterPath: string,
    buttonsArr: ProductButton[]
): Promise<void[]> {
    return Promise.all(Object.keys(remotes)
    .map(projectId => loadModule(projectId, remotes, router, buttonsArr)))
}

function preloadRoutes(routes: Routes, preloadStrategy: CustomPreloadingStrategy) {
  routes.forEach((route) => {
    if (route.data && route.data['preload']) {
      const load = () => route.loadChildren!() as Observable<any>;
      preloadStrategy.preload(route, load).subscribe();
    }
  });
}