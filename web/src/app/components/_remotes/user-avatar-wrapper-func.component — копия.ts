// user-avatar-wrapper.component.ts (host)
import { Component, Input, ElementRef, AfterViewInit, OnChanges, Injector } from '@angular/core';
import { DynamicLoaderService } from '../../services/dynamic-loader.service';

@Component({
  selector: 'app-user-avatar-wrapper-func',
  template: `<div #container></div>`
})
export class UserAvatarWrapperFuncComponent implements AfterViewInit, OnChanges {
  @Input() remoteEntry!: string;
  @Input() exposedModule!: string;
  @Input() remoteName: string = 'au'
  @Input() name: string = '';
  @Input() avatarUrl: string | null = null;
  @Input() size: any = 'md';
  @Input() backgroundColor: string = '';

  private customElement: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    private loader: DynamicLoaderService,
    private injector: Injector
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
      // Load the setup function
      const userAvatarSetup: any = await this.loader.loadModule(
        this.remoteEntry,
        this.exposedModule,
        this.remoteName
      );

      // Register the custom element with the host's injector
      if (userAvatarSetup.setupUserAvatar) {
        // Pass the host's injector for proper DI
        userAvatarSetup.setupUserAvatar(this.injector);
      } else {
        console.error('no setupUserAvatar function in loaded module')
      }

      // Create the custom element
      this.createCustomElement();

    } catch (error) {
      console.error('Failed to setup user avatar:', error);
      this.showFallback();
    }
  }

  private createCustomElement(): void {
    const container = this.elementRef.nativeElement.querySelector('div');
    if (!container) return;

    container.innerHTML = '';
    
    this.customElement = document.createElement('user-avatar');
    this.updateCustomElement();
    container.appendChild(this.customElement);
  }

  private updateCustomElement(): void {
    if (!this.customElement) return;

    this.customElement.setAttribute('name', this.name);
    this.customElement.setAttribute('size', this.size.toString());
    
    if (this.avatarUrl) {
      this.customElement.setAttribute('avatar-url', this.avatarUrl);
    } else {
      this.customElement.removeAttribute('avatar-url');
    }
    
    if (this.backgroundColor) {
      this.customElement.setAttribute('background-color', this.backgroundColor);
    } else {
      this.customElement.removeAttribute('background-color');
    }
  }

  private showFallback(): void {
    const container = this.elementRef.nativeElement.querySelector('div');
    if (container) {
      container.innerHTML = `
        <div style="width: 50px; height: 50px; border-radius: 50%; background: 'red'; 
                    display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-weight: bold;">?</span>
        </div>
      `;
    }
  }
}