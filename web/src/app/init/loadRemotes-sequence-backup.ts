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
  buttonsArr: ProductButton[],
): Promise<void> {
  const childRoutes: Routes = [
    {
      path: remotes[projectId as keyof typeof remotes].routerPath,
      loadChildren: () => {
        return loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript).then(
          (m) => {
            const remoteModule = m[remotes[projectId as keyof typeof remotes].moduleName!];
            return remoteModule;
          },
        );
      },
      data: { preload: remotes[projectId as keyof typeof remotes].routerPath === 'faq' },
    },
  ];

  // Add the new routes to the router configuration
  router.resetConfig([...router.config, ...childRoutes]);

  // Render the product main button
  renderProductMainButton(projectId, remotes, buttonsArr);

  // Preload the routes if needed
  // preloadRoutes(childRoutes, preloadStrategy);
}

export async function loadRemotes(
  remotes: Remotes,
  router: Router,
  currentRouterPath: string,
  buttonsArr: ProductButton[],
): Promise<void> {
  for (const projectId of Object.keys(remotes)) {
    await loadModule(projectId, remotes, router, buttonsArr);
  }
}

function preloadRoutes(routes: Routes, preloadStrategy: CustomPreloadingStrategy): void {
  routes.forEach((route) => {
    if (route.data && route.data['preload']) {
      const load = () => route.loadChildren!() as Observable<any>;
      preloadStrategy.preload(route, load).subscribe();
    }
  });
}