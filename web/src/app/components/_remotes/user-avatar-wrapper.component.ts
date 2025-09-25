// user-avatar-wrapper.component.ts
import { Component, Input, ViewContainerRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ComponentRef, Injector } from '@angular/core';
import { DynamicLoaderService } from '../../services/dynamic-loader.service';


@Component({
  selector: 'app-user-avatar-wrapper',
  template: `<ng-container #container></ng-container>`
})
export class UserAvatarWrapperComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() remoteEntry!: string;
  @Input() remoteName: string = 'userProfile123';
  @Input() avatarUrl: string | null = null;
  @Input() name: string = '';
  @Input() size: any = 'md';
  @Input() backgroundColor: string = '';

  private componentRef: ComponentRef<any> | null = null;
  private isComponentLoaded = false;
  private loadTimeout: any;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private loader: DynamicLoaderService,
    private injector: Injector
  ) {}

  ngAfterViewInit() {
    // Load the component once with 2-second delay after view init
    this.loadTimeout = setTimeout(() => {
      this.loadComponent();
    }, 2000);
  }

  async ngOnChanges(changes: SimpleChanges) {
    // Only update inputs if component is already loaded
    if (this.isComponentLoaded && this.componentRef) {
      this.updateInputs();
    }
  }

  private async loadComponent(): Promise<void> {
    if (!this.remoteEntry || !this.remoteName) {
      console.warn('remoteEntry and remoteName are required');
      return;
    }

    if (this.isComponentLoaded) {
      return; // Already loaded, don't load again
    }

    this.viewContainerRef.clear();
    
    try {
      // Load the component class
      const loadedModule = await this.loader.loadModule(
        this.remoteEntry,
        './UserAvatarComponent',
        this.remoteName
      ) as any;

      console.log('DEBUG: Loaded module', loadedModule);

      // Handle different possible return formats
      let componentClass: any;

      // Case 1: Direct component class
      if (this.isComponentClass(loadedModule)) {
        componentClass = loadedModule;
      }
      // Case 2: Module with default export
      else if (loadedModule?.default && this.isComponentClass(loadedModule.default)) {
        componentClass = loadedModule.default;
      }
      // Case 3: Look for any exported class that might be a component
      else {
        const exportedValues = Object.values(loadedModule as any);
        componentClass = exportedValues.find(value => this.isComponentClass(value));
      }

      if (!componentClass) {
        throw new Error('No valid Angular component found in the loaded module');
      }

      console.log('DEBUG: Creating component with class', componentClass);

      // Create the component using the modern API
      this.componentRef = this.viewContainerRef.createComponent(componentClass, {
        injector: this.injector
      });

      this.updateInputs();
      this.isComponentLoaded = true;
      
    } catch (error) {
      console.error('Failed to load UserAvatar component:', error);
      this.showFallback();
    }
  }

  private isComponentClass(obj: any): boolean {
    return typeof obj === 'function' && 
      (obj.prototype?.constructor?.name !== 'Object' ||
        obj.toString().includes('class'));
  }

  private updateInputs(): void {
    if (!this.componentRef) return;

    // Use direct assignment for maximum compatibility
    const instance = this.componentRef.instance;
    
    instance.avatarUrl = this.avatarUrl;
    instance.name = this.name;
    instance.size = this.size;
    instance.backgroundColor = this.backgroundColor;
    
    // Trigger change detection
    this.componentRef.changeDetectorRef.detectChanges();
  }

  private showFallback(): void {
    this.viewContainerRef.clear();
    const fallback = document.createElement('div');
    fallback.innerHTML = `
      <div style="width: 50px; height: 50px; border-radius: 50%; background: #ccc; 
                  display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-weight: bold;">?</span>
      </div>
    `;
    this.viewContainerRef.element.nativeElement.appendChild(fallback);
  }

  ngOnDestroy() {
    // Clear the timeout if component is destroyed before it fires
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }

    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}