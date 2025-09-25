import { Injectable, Injector } from "@angular/core";

import { dd } from "../../../utilites/dd";
import { DynamicLoaderService } from "../../../services/dynamic-loader.service";

export const ElementsMap = {
  SELECT__SELECT_ONE: 'gui-select',
  INPUT__RADIO: 'gui-toggle',
  INPUT__TEXT: 'gui-input',
  INPUT__PASSWORD: 'gui-input',
  INPUT__COLOR: 'gui-input-color',
  BUTTON__SUBMIT: 'gui-button',
  BUTTON__BUTTON: 'gui-button',
  DIV__USER_AVATAR: 'au-user-avatar',
}

@Injectable({
  providedIn: 'root',
})
export class GuiService {
  
  constructor(
    private loader: DynamicLoaderService,
    private injector: Injector
  ) {}

  public async getCustomElement(elementName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (ElementsMap[elementName as keyof typeof ElementsMap]) {
          const customElementName = ElementsMap[elementName as keyof typeof ElementsMap];
          const remoteName = getRemoteNameFromCustomElementName(customElementName);
          
          // Determine which remote to load based on the element type
          const remoteConfig = this.getRemoteConfigForElement(customElementName);
          
          const isRemoteLoaded = !!((window as any)[remoteName]);
          const isCustomElementRegistered = customElements.get(customElementName);

          // this.loader.getInfo(remoteName)
          
          if (!isRemoteLoaded && !isCustomElementRegistered) {
            // console.log(`Loading remote ${remoteName} for element ${customElementName}`);
            
            const loadedModule: any = await this.loader.loadModule(
              remoteConfig.remoteEntry,
              remoteConfig.exposedModule,
              remoteName
            );
            
            await this.defineElement(loadedModule, customElementName);
          } else if (isRemoteLoaded && !isCustomElementRegistered) {
            // Remote is loaded but element not registered - try to get from container
            const container = (window as any)[remoteName];
            const factory = await container.get(remoteConfig.exposedModule);
            const loadedModule = factory();
            await this.defineElement(loadedModule, customElementName);
          }
          
          resolve(customElementName);
        } else {
          throw new Error(`unknown element: ${elementName}`);
        }
      } catch (e) {
        reject(e);
      }
    });
  }

  private getRemoteConfigForElement(customElementName: string): { remoteEntry: string; exposedModule: string } {
    // Determine which remote to use based on element prefix
    if (customElementName.startsWith('gui-')) {
      return {
        remoteEntry: `${process.env["GUI_WEB_URL"]}/remoteEntry4209.js`,
        exposedModule: './Exposed'
      };
    } else if (customElementName.startsWith('au-')) {
      return {
        remoteEntry: `${process.env["AU_WEB_URL"]}/remoteEntry2.js`,
        exposedModule: './Exposed'
      };
    } else {
      throw new Error(`Unknown element prefix: ${customElementName}`);
    }
  }

  public async defineElement(loadedModule: any, customElementName: string) {
    try {
      if (loadedModule.defineCustomElement) {
        loadedModule.defineCustomElement(customElementName, this.injector);
      } else {
        // Alternative: look for component classes in the module
        const componentClass = this.findComponentClass(loadedModule, customElementName);
        if (componentClass) {
          customElements.define(customElementName, componentClass);
        } else {
          throw new Error(`No defineCustomElement function or component class found for ${customElementName}`);
        }
      }
    } catch (error) {
      console.error('Failed to defineElement:', error);
      throw error;
    }
  }

  private findComponentClass(module: any, customElementName: string): any {
    // Look for a class that might be a web component
    for (const key of Object.keys(module)) {
      const exportItem = module[key];
      if (typeof exportItem === 'function' && exportItem.prototype instanceof HTMLElement) {
        return exportItem;
      }
    }
    return null;
  }
}

export const isRemoteLoaded = (remoteName: string): boolean => {
  const container = (window as any)[remoteName];
  dd(`[${remoteName}] is loaded: ${!!container}`);
  return !!container;
}

export const getRemoteNameFromCustomElementName = (customElementName: string): string => {
  return customElementName.split('-')[0];
}