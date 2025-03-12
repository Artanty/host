import { Router, Routes } from "@angular/router";
import { ProductButton, Remotes } from "../app.component.types";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { renderProductMainButton } from "./renderAppsButtons";

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
      },
    ];
    router.resetConfig([...router.config, ...childRoutes]);
    
    // this._sendRoutePathToRemoteMfe(projectId)
    // this._remoteConfigService.setRemoteConfig(remotes, projectId)
    
    // this._renderProductMainButton(projectId)
    renderProductMainButton(projectId, remotes, buttonsArr)
}

export async function loadRemotes (
    remotes: Remotes, 
    router: Router,
    buttonsArr: ProductButton[]
): Promise<void[]> {
    return Promise.all(Object.keys(remotes)
    .map(projectId => loadModule(projectId, remotes, router, buttonsArr)))
    // .then(() => {
    //   const busEvent: BusEvent = {
    //     from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
    //     to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
    //     event: 'ADD_REMOTES_DONE',
    //     payload: null,
    //   };
    //   this.eventBusPusher(busEvent);
    // })
}