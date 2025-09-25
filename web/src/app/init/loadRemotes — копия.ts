import { Route, Router, Routes } from "@angular/router";
import { ProductButton, RemoteBody, Remotes } from "../app.component.types";
import { loadRemoteModule } from "@angular-architects/module-federation";
import { renderProductMainButton } from "./renderAppsButtons";
import { remotes } from "../app.component.data";

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
): Promise<{ success: boolean; failedRemotes: string[] }> {
  const routes: Routes = [];
  const failedRemotes: string[] = [];
  const promises: Promise<void>[] = [];

  Object.entries(remotes).forEach(([projectId, remoteConfig]) => {
    const loadPromise = (async () => {
      try {
        const m = await loadRemoteModule(remoteConfig.remoteModuleScript);
        
        if (!m?.[remoteConfig.moduleName!]) {
          throw new Error(`Module ${remoteConfig.moduleName} not found`);
        }

        const route: Route = {
          path: remoteConfig.routerPath,
          loadChildren: () => Promise.resolve(m[remoteConfig.moduleName!]),
          data: { preload: remoteConfig.preload }
        };
        
        routes.push(route);
        renderProductMainButton(projectId, remotes, buttonsArr, 'initial'); // todo replace
        
      } catch (error) {
        failedRemotes.push(projectId);
        // console.error(`Failed to load remote ${projectId}:`, error);
        renderProductMainButton(projectId, remotes, buttonsArr, 'failed');  // todo replace
      }
    })();

    promises.push(loadPromise);
  });

  await Promise.all(promises);
  
  if (routes.length > 0) {
    // console.log('router.config')
    // console.log(router.config)
    // console.log('routes')
    // console.log(routes)
    router.resetConfig([...router.config, ...routes]);
  }

  return {
    success: failedRemotes.length === 0,
    failedRemotes
  };
}



export async function retryRemoteLoad(projectId: string, router: Router, buttonsArr: any[]): Promise<void> {
  try {
    const remoteConfig = await getRemoteConfig(projectId);

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
        preload: true 
      }
    }
    
    const routes: Route[] = router.config
    routes.push(newRoute)
    router.resetConfig(routes)
    
    return Promise.resolve()
  } catch (error: unknown) {
    throw new Error(`Retry failed for ${projectId}: ${error}`);
  }
}

async function getRemoteConfig(projectId: string): Promise<RemoteBody> {
  return remotes[projectId];
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
  renderProductMainButton(projectId, remotes, buttonsArr, 'initial')

  return Promise.resolve([])
}

//unused
function handleConnectionError(error: any, url: any) {
  if (error.message.includes('ERR_CONNECTION_REFUSED') || 
    error.message.includes('Failed to fetch') ||
    error.code === 'ECONNREFUSED') {
        
    console.error('Connection refused to:', url);
        
    return true; // Error was handled
  }
  return false; // Error was not handled
}

export async function updateRemote(
  projectId: string,
  remotes: Remotes, 
  router: Router,
  buttonsArr: ProductButton[],
): Promise<boolean> {
  
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
      preload: true 
    }
  }

  const remoteRouterPath = remotes[projectId].routerPath
  const currentConfig = router.config;

  const updatedConfig = currentConfig.map(route => 
    route.path === remoteRouterPath ? newRoute : route
  );
  router.resetConfig(updatedConfig);

  if ((window as any)[`webpackChunk${remoteRouterPath}`]) {
    (window as any)[`webpackChunk${remoteRouterPath}`] = undefined
    delete (window as any)[`webpackChunk${remoteRouterPath}`]
  }
  if ((window as any).window[`${remoteRouterPath}`]) {
    (window as any).window[`${remoteRouterPath}`] = undefined
  }

  // this._sendRoutePathToRemoteMfe(projectId)
  // renderProductMainButton(projectId, remotes, buttonsArr, 'initial')

  return Promise.resolve(true)
}

