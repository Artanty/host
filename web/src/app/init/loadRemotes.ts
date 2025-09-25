import { Route, Router, Routes } from '@angular/router';

import { renderProductMainButton } from './renderAppsButtons';
import { remotes } from '../app.component.data';
import { ProductButton, RemoteBody, Remotes } from '../app.component.types';
import { DynamicLoaderService } from '../services/dynamic-loader.service';


export async function loadRemotes(
  remotes: Remotes, 
  router: Router,
  buttonsArr: ProductButton[],
  dynamicLoader: DynamicLoaderService
): Promise<{ success: boolean; failedRemotes: string[] }> {
  const routes: Routes = [];
  const failedRemotes: string[] = [];

  // Load sequentially to avoid conflicts
  for (const [projectId, remoteConfig] of Object.entries(remotes)) {
    try {
      // console.log(`Loading MFE remote: ${projectId}`);

      // Load the MFE module (not Angular module directly)
      const mfeModule = await dynamicLoader.loadModule(
        remoteConfig.remoteModuleScript.remoteEntry as string,
        remoteConfig.remoteModuleScript.exposedModule,
        remoteConfig.remoteModuleScript.remoteName
      );

      // The MFE module should expose Angular modules
      // Check what's available in the MFE module
      // console.log(`MFE module ${projectId} exports:`, Object.keys(mfeModule));

      // Get the Angular module from the MFE module
      const angularModule = mfeModule[remoteConfig.moduleName!];
      if (!angularModule) {
        throw new Error(`Angular module '${remoteConfig.moduleName}' not found in MFE module`);
      }

      // Verify it's an Angular module
      if (!angularModule.ɵmod) {
        throw new Error(`Exported module is not a valid Angular NgModule`);
      }

      const route: Route = {
        path: remoteConfig.routerPath,
        loadChildren: () => Promise.resolve(angularModule),
        data: { preload: remoteConfig.preload }
      };
      
      routes.push(route);
      renderProductMainButton(projectId, remotes, buttonsArr, 'initial');
      
    } catch (error) {
      console.error(`Failed to load MFE remote ${projectId}:`, error);
      failedRemotes.push(projectId);
      renderProductMainButton(projectId, remotes, buttonsArr, 'failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (routes.length > 0) {
    router.resetConfig([...router.config, ...routes]);
  }

  return {
    success: failedRemotes.length === 0,
    failedRemotes
  };
}
async function getRemoteConfig(projectId: string): Promise<RemoteBody> {
  return remotes[projectId];
}
export async function retryRemoteLoad(
  projectId: string, 
  router: Router, 
  buttonsArr: any[],
  dynamicLoader: DynamicLoaderService
): Promise<void> {
  try {
    const remoteConfig = await getRemoteConfig(projectId);
    
    // Clear cache before retry
    dynamicLoader.cleanupFailedRemote(
      remoteConfig.remoteModuleScript.remoteEntry as string,
      remoteConfig.moduleName
    );

    const m = await dynamicLoader.loadModule(
      remoteConfig.remoteModuleScript.remoteEntry as string,
      remoteConfig.moduleName!,
      remoteConfig.remoteModuleScript.remoteName
    );

    const newRoute: Route = {
      path: remoteConfig.routerPath,
      loadChildren: () => Promise.resolve(m),
      data: { preload: true }
    };
    
    const routes: Route[] = router.config;
    routes.push(newRoute);
    router.resetConfig(routes);
    
  } catch (error: unknown) {
    throw new Error(`Retry failed for ${projectId}: ${error}`);
  }
}

export async function updateRemote(
  projectId: string,
  remotes: Remotes, 
  router: Router,
  buttonsArr: ProductButton[],
  dynamicLoader: DynamicLoaderService
): Promise<boolean> {
  const remoteConfig = remotes[projectId];
  
  // Clear the cached module
  dynamicLoader.cleanupFailedRemote(
    remoteConfig.remoteModuleScript.remoteEntry as string,
    remoteConfig.moduleName
  );

  try {
    // Reload the module
    const m = await dynamicLoader.loadModule(
      remoteConfig.remoteModuleScript.remoteEntry as string,
      remoteConfig.moduleName!,
      remoteConfig.remoteModuleScript.remoteName
    );

    const newRoute: Route = {
      path: remoteConfig.routerPath,
      loadChildren: () => Promise.resolve(m),
      data: { preload: true }
    };

    const currentConfig = router.config;
    const updatedConfig = currentConfig.map(route => 
      route.path === remoteConfig.routerPath ? newRoute : route
    );
    
    router.resetConfig(updatedConfig);
    renderProductMainButton(projectId, remotes, buttonsArr, 'initial');
    
    return true;
  } catch (error) {
    console.error(`Failed to update remote ${projectId}:`, error);
    return false;
  }
}