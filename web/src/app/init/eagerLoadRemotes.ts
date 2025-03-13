import { loadRemoteModule } from "@angular-architects/module-federation";
import { RemoteBody, Remotes } from "../app.component.types";
import { EVENT_BUS } from "typlib";
import { Inject, Injector } from "@angular/core";
import { BehaviorSubject } from "rxjs";

let remoteModule1: any; // Store the loaded module reference

/**
     * In Angular, modules are instantiated only once during the application's lifecycle. 
     * When you eagerly load the remote module using new remoteModule.AuthModule() in your code,
     * Angular creates an instance of the module and registers it in the dependency injection system.
     * When you later navigate to the route that lazy-loads the same module, 
     * Angular detects that the module has already been instantiated and does not create a new instance. 
     * Instead, it reuses the existing instance.
     */
export async function eagerLoadRemoteModule (
    projectId: string, 
    currentRouterPath: string, 
    remotes: Remotes,
    injector: Injector
): Promise<void> {
    /**
     * Жадно загружаем модуль только в случае, если не находимся на его роуте.
     * Когда находимся на роуте, он лениво подгрузится и так.
     */
    if (currentRouterPath !== remotes[projectId as keyof typeof remotes]?.routerPath){
      // console.log('remotes[projectId as keyof typeof remotes].remoteModuleScript')
      // console.log(remotes[projectId as keyof typeof remotes].remoteModuleScript)
      const remoteModule = await loadRemoteModule(remotes[projectId as keyof typeof remotes].remoteModuleScript);
      /**
       * When you manually instantiate a class using new, 
       * Angular's dependency injection system is bypassed. 
       * As a result, any dependencies (like EVENT_BUS_LISTENER) are not injected, leading to undefined values.
       */
      // const constructor = [
      //   injector.get(EVENT_BUS),
      //   // this.injector.get(EVENT_BUS_LISTENER),
      //   // this.injector.get(EVENT_BUS_PUSHER)
      // ]
      // new remoteModule.AuthModule(...constructor)  
      
      // Create a BehaviorSubject instance
      const routerPathSubject = new BehaviorSubject<string>(remotes[projectId].routerPath);

      // Create a provider for ROUTER_PATH
      const routerPathProvider = {
        provide: 'ROUTER_PATH',
        useValue: routerPathSubject
      };
      const enrichedInjector = Injector.create({
        providers: [routerPathProvider],
        parent: injector
      })
      // console.log('CREATING MODULE')
      remoteModule1 = new remoteModule.AuthModule(enrichedInjector)
    }
    // setTimeout(() => {
    //   unloadModule()
    // }, 3000)
    return Promise.resolve()
}

function unloadModule() {
  console.log(remoteModule1)
  if (remoteModule1) {    
    remoteModule1 = null; // Clear the reference
    console.log('Module unloaded');
    console.log(remoteModule1)
  }
}

export async function eagerLoadRemoteModules (
    remotes: Remotes, 
    currentRouterPath: string, 
    injector: Injector
): Promise<void> {
    const eagerModules = Object.entries(remotes)
    .filter(([_, value]: [string, RemoteBody]) => {
      return value.isEagerLoading
    })
    .map(([projectId]: [string, RemoteBody]): any => {
      return eagerLoadRemoteModule(projectId, currentRouterPath, remotes, injector)
    })
    
    await Promise.all(eagerModules)
  }