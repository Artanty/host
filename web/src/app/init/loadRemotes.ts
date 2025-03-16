import { Route, Router, Routes } from "@angular/router";
import { ProductButton, RemoteBody, Remotes } from "../app.component.types";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { renderProductMainButton } from "./renderAppsButtons";

export async function loadRemotes (
    remotes: Remotes, 
    router: Router,
    buttonsArr: ProductButton[],
    
): Promise<void[]> {
  const routes: Routes = []
  Object.entries(remotes).forEach(([projectId, body]: [string, RemoteBody]) => {
    const route: Route = {
      path: remotes[projectId as keyof typeof remotes].routerPath,
      loadChildren: () => {
        return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript)
        .then((m) => {
          const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName!]
          
          return remoteModule
        })
      },
      data: { 
        preload: remotes[projectId as keyof typeof remotes].routerPath === 'au' 
      }
    }
    routes.push(route)
    // this._sendRoutePathToRemoteMfe(projectId)
    renderProductMainButton(projectId, remotes, buttonsArr)
  })
  router.resetConfig([...router.config, ...routes]);
  
  return Promise.resolve([])
}

