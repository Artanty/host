import { Route, Router, Routes } from "@angular/router";
import { ProductButton, RemoteBody, Remotes } from "../app.component.types";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { renderProductMainButton } from "./renderAppsButtons";

/**
 * Происходит на res.event === "ADD_REMOTES"
 * Берется 
 * - конфиг remotes: Remotes с адресами ремоутов, кнопками
 * - роутер для добавления роутов ремоутов
 * - пустой массив кнопок для их добавления
 * */
export async function loadRemotes(
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
          }).catch((e) => {
            console.log('catched')
            return;
          })
      },
      data: {
        preload: remotes[projectId as keyof typeof remotes].preload 
      }
    }
    routes.push(route)
    // this._sendRoutePathToRemoteMfe(projectId)
    renderProductMainButton(projectId, remotes, buttonsArr)
  })
  router.resetConfig([...router.config, ...routes]);
  
  return Promise.resolve([])
}

export async function updateRemotes(
  remotes: Remotes, 
  router: Router,
  buttonsArr: ProductButton[],
): Promise<void[]> {
  // const routes: Routes = []
  // Object.entries(remotes).forEach(([projectId, body]: [string, RemoteBody]) => {
    
  // })
  // router.resetConfig([...router.config, ...routes]);

  const projectId = 'faq'
  const newRoute: Route = {
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
  const currentConfig = router.config;

  const updatedConfig = currentConfig.map(route => 
    route.path === 'faq' ? newRoute : route
  );
  router.resetConfig(updatedConfig);

  if ((window as any).webpackChunkfaq) {
    (window as any).webpackChunkfaq = undefined
    delete (window as any).webpackChunkfaq
  }
  if ((window as any).window.faq) {
    (window as any).window.faq = undefined
  }

  // this._sendRoutePathToRemoteMfe(projectId)
  renderProductMainButton(projectId, remotes, buttonsArr)

  return Promise.resolve([])
}

