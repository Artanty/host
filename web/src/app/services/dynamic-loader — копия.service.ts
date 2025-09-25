// dynamic-loader.service.ts (with enhanced debugging)
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicLoaderService {
  
  private loadedRemotes = new Set<string>();

  async loadStandaloneComponent<T>(remoteEntry: string, exposedModule: string, remoteName: string): Promise<T> {
    try {
      console.log('Loading remote:', { remoteEntry, remoteName, exposedModule });

      // Load the remote entry
      await this.loadRemoteEntry(remoteEntry, remoteName);

      // Check what's actually registered in window
      console.log('Window objects:', Object.keys(window).filter(key => 
        key.includes('webpack') || key.includes('remote') || key === remoteName
      ));

      const container = (window as any)[remoteName];
      console.log('Container found:', container);

      if (!container) {
        const availableContainers = Object.keys(window).filter(key => 
          typeof (window as any)[key] === 'object' && (window as any)[key]?.get
        );
        throw new Error(`Remote container '${remoteName}' not found. Available: ${availableContainers.join(', ')}`);
      }

      // Initialize sharing
      await __webpack_init_sharing__('default');
      
      // Initialize the container
      await container.init(__webpack_share_scopes__.default);
      
      // Get the factory
      const factory = await container.get(exposedModule);
      const module = factory();
      
      console.log('Module loaded:', module);
      return module.default || module;

    } catch (error) {
      console.error('Failed to load standalone component:', error);
      throw error;
    }
  }

  private async loadRemoteEntry(remoteEntry: string, remoteName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded by looking for the container
      if ((window as any)[remoteName]) {
        console.log('Remote already loaded:', remoteName);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = remoteEntry;
      
      script.onload = () => {
        console.log('Script loaded, checking for container...');
        
        // Give it a moment to register
        setTimeout(() => {
          if ((window as any)[remoteName]) {
            console.log('Container registered successfully:', remoteName);
            resolve();
          } else {
            // Check for any webpack containers
            const containers = Object.keys(window).filter(key => 
              typeof (window as any)[key] === 'object' && (window as any)[key]?.init
            );
            console.log('Available containers:', containers);
            reject(new Error(`Remote '${remoteName}' not registered. Found: ${containers.join(', ')}`));
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