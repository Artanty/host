// dynamic-loader.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DynamicLoaderService {
  
  private loadedRemotes = new Set<string>();
  private loadedMfeModules = new Map<string, any>();
  private loadedMfeModulesByName = new Map<string, any>();
  public getInfo(remoteName: string): any {
    // console.log(this.loadedRemotes)
    // console.log(this.loadedMfeModules)
    const remote = this.loadedMfeModulesByName.get(remoteName)
    // console.log(remote)
    if (remote) {
      return {
        remote: remote,
        exposed: Object.keys(remote)
      }
    }
    return false
  }
  async loadModule(remoteEntry: string, exposedModule: string, remoteName: string): Promise<any> {
    const cacheKey = `${remoteEntry}-${exposedModule}`;
    
    if (this.loadedMfeModules.has(cacheKey)) {
      return this.loadedMfeModules.get(cacheKey);
    }

    try {
      // console.log('Loading MFE module:', { remoteEntry, remoteName, exposedModule });
      // Store original public path
      const originalPublicPath = (window as any).__webpack_require__?.p;
      
      // Set correct public path for this remote
      this.setWebpackPublicPath(remoteEntry);

      // Load the remote entry
      await this.loadRemoteEntry(remoteEntry, remoteName);

      const container = (window as any)[remoteName];
      if (!container) {
        throw new Error(`Remote container '${remoteName}' not found`);
      }

      // Initialize sharing if needed
      await this.initializeContainer(container, remoteName);

      // Get the MFE module factory
      const factory = await container.get(exposedModule);
      if (!factory) {
        throw new Error(`MFE module '${exposedModule}' not found in container`);
      }

      // Execute the factory to get the MFE module
      const mfeModule = factory();
      
      // console.log('MFE module loaded successfully:', mfeModule);
      
      this.loadedMfeModules.set(cacheKey, mfeModule);

      this.loadedMfeModulesByName.set(remoteName, mfeModule)
      
      // Restore original public path
      this.restoreWebpackPublicPath(originalPublicPath);
      
      return mfeModule;

    } catch (error: any) {
      console.error('Failed to load MFE module:', error);
      this.cleanupFailedRemote(remoteEntry, remoteName);
      throw error;
    }
  }

  private setWebpackPublicPath(remoteEntry: string): void {
    // Extract base URL from remoteEntry (e.g., http://localhost:4204/ from http://localhost:4204/remoteEntry2.js)
    const baseUrl = remoteEntry.substring(0, remoteEntry.lastIndexOf('/') + 1);
    
    // Set webpack public path temporarily
    if ((window as any).__webpack_require__) {
      (window as any).__webpack_require__.p = baseUrl;
      // console.log(`Set webpack public path to: ${baseUrl}`);
    }
  }

  private restoreWebpackPublicPath(originalPath: string | undefined): void {
    if ((window as any).__webpack_require__ && originalPath !== undefined) {
      (window as any).__webpack_require__.p = originalPath;
      // console.log(`Restored webpack public path to: ${originalPath}`);
    }
  }

  private async initializeContainer(container: any, remoteName: string): Promise<void> {
    if (container.init && !container._initialized) {
      try {
        await __webpack_init_sharing__('default');
        await container.init(__webpack_share_scopes__.default);
        container._initialized = true;
      } catch (error: any) {
        if (error.message.includes('already been initialized')) {
          console.warn(`Container ${remoteName} already initialized, continuing...`);
          container._initialized = true;
          return;
        }
        throw error;
      }
    }
  }

  private async loadRemoteEntry(remoteEntry: string, remoteName: string): Promise<void> {
    if (this.loadedRemotes.has(remoteEntry)) {
      return;
    }

    if ((window as any)[remoteName]) {
      this.loadedRemotes.add(remoteEntry);
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = remoteEntry;
      
      script.onload = () => {
        setTimeout(() => {
          if ((window as any)[remoteName]) {
            this.loadedRemotes.add(remoteEntry);
            resolve();
          } else {
            reject(new Error(`Remote container not registered: ${remoteName}`));
          }
        }, 100);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load remote entry: ${remoteEntry}`));
      };
      
      document.head.appendChild(script);
    });
  }

  cleanupFailedRemote(remoteEntry: string, remoteName: string): void {
    this.loadedRemotes.delete(remoteEntry);
    
    // Clear all modules from this remote
    for (const key of this.loadedMfeModules.keys()) {
      if (key.startsWith(`${remoteEntry}-`)) {
        this.loadedMfeModules.delete(key);
      }
    }
    
    const scripts = document.querySelectorAll(`script[src="${remoteEntry}"]`);
    scripts.forEach(script => script.remove());
    
    // Clean up container reference
    if ((window as any)[remoteName]) {
      delete (window as any)[remoteName];
    }
  }
}

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: any };