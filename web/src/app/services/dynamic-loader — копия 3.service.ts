// dynamic-loader.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicLoaderService {
  
  private loadedRemotes = new Set<string>();
  private initializedContainers = new Set<string>();

  async loadModule<T>(remoteEntry: string, exposedModule: string, remoteName: string): Promise<T> {
    try {
      console.log('Loading remote module:', { remoteEntry, remoteName, exposedModule });

      // Load the remote entry
      await this.loadRemoteEntry(remoteEntry, remoteName);

      const container = (window as any)[remoteName];
      if (!container) {
        throw new Error(`Remote container '${remoteName}' not found`);
      }

      // Initialize sharing only if not already initialized
      await this.initializeContainer(container, remoteName);

      // Get the factory
      const factory = await container.get(exposedModule);
      const module = factory();
      
      console.log('Module loaded:', module);
      return module as T;

    } catch (error) {
      console.error('Failed to load module:', error);
      throw error;
    }
  }

  private async initializeContainer(container: any, remoteName: string): Promise<void> {
    // Check if already initialized
    if (this.initializedContainers.has(remoteName)) {
      console.log(`Container ${remoteName} already initialized, skipping`);
      return;
    }

    // Initialize sharing
    await __webpack_init_sharing__('default');
    
    // Initialize the container
    await container.init(__webpack_share_scopes__.default);
    
    this.initializedContainers.add(remoteName);
    console.log(`Container ${remoteName} initialized successfully`);
  }

  private async loadRemoteEntry(remoteEntry: string, remoteName: string): Promise<void> {
    // Check if already loaded
    if (this.loadedRemotes.has(remoteEntry)) {
      console.log('Remote already loaded:', remoteEntry);
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = remoteEntry;
      
      script.onload = () => {
        console.log('Script loaded, checking for container...');
        
        setTimeout(() => {
          if ((window as any)[remoteName]) {
            console.log('Container registered successfully:', remoteName);
            this.loadedRemotes.add(remoteEntry);
            resolve();
          } else {
            reject(new Error(`Remote '${remoteName}' not registered after loading`));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('Script load error:', error);
        reject(new Error(`Failed to load remote entry: ${error}`));
      };
      
      console.log('Appending script:', remoteEntry);
      document.head.appendChild(script);
    });
  }
}

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: any };