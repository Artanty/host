// user-avatar-wrapper.component.ts (host)
import { Component, Input, ElementRef, AfterViewInit, OnChanges, Injector, NgModuleRef, Compiler } from '@angular/core';
import { DynamicLoaderService } from '../../services/dynamic-loader.service';

@Component({
  selector: 'app-user-avatar-wrapper-module',
  template: `<div #container></div>`
})
export class UserAvatarWrapperModuleComponent implements AfterViewInit, OnChanges {
  @Input() remoteEntry!: string;
  @Input() remoteName: string = 'au';
  @Input() exposedModule!: string;
  @Input() name: string = '';
  @Input() avatarUrl: string | null = null;
  @Input() size: any = 'md';
  @Input() backgroundColor: string = '';

  private customElement: HTMLElement | null = null;
  private moduleRef: NgModuleRef<any> | null = null;

  constructor(
    private elementRef: ElementRef,
    private loader: DynamicLoaderService,
    private injector: Injector,
    private compiler: Compiler
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupAndCreateElement();
    }, 2000);
  }

  async ngOnChanges() {
    this.updateCustomElement();
  }

  private async setupAndCreateElement(): Promise<void> {
    try {
      // Load the module object
      const moduleObject: any = await this.loader.loadModule(
        this.remoteEntry,
        this.exposedModule,
        this.remoteName
      );

      // Extract the NgModule class
      const moduleClass = moduleObject.UserAvatarModule || moduleObject.default;
      
      if (!moduleClass) {
        throw new Error('UserAvatarModule class not found in loaded module');
      }

      // Compile and create the module instance
      const moduleFactory = await this.compiler.compileModuleAsync(moduleClass);
      this.moduleRef = moduleFactory.create(this.injector);

      // Get the module instance and trigger ngDoBootstrap
      const moduleInstance = this.moduleRef.instance;
      
      if (moduleInstance && typeof moduleInstance.ngDoBootstrap === 'function') {
        // Create a minimal mock ApplicationRef
        const mockAppRef = {
          bootstrap: (component: any) => {
            console.log('Component bootstrapped:', component);
            return component;
          }
        };
        
        // Trigger ngDoBootstrap
        moduleInstance.ngDoBootstrap(mockAppRef);
        console.log('ngDoBootstrap executed successfully');
      }

      // Create the custom element
      this.createCustomElement();

    } catch (error) {
      console.error('Failed to setup user avatar:', error);
    }
  }

  private createCustomElement(): void {
    const container = this.elementRef.nativeElement.querySelector('div');
    if (!container) return;

    container.innerHTML = '';
    
    // Check if custom element was registered
    if (typeof customElements !== 'undefined' && customElements.get('user-avatar')) {
      this.customElement = document.createElement('user-avatar');
      this.updateCustomElement();
      container.appendChild(this.customElement);
    }
  }

  private updateCustomElement(): void {
    if (!this.customElement) return;

    this.customElement.setAttribute('name', this.name);
    this.customElement.setAttribute('size', this.size.toString());
    
    if (this.avatarUrl) {
      this.customElement.setAttribute('avatar-url', this.avatarUrl);
    }
    
    if (this.backgroundColor) {
      this.customElement.setAttribute('background-color', this.backgroundColor);
    }
  }

  ngOnDestroy() {
    if (this.moduleRef) {
      this.moduleRef.destroy();
    }
  }
}