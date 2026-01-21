import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withInterceptors, withInterceptorsFromDi } from "@angular/common/http"
import { APP_INITIALIZER, Inject, Injector, NgModule } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { BrowserModule } from "@angular/platform-browser"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { BehaviorSubject, filter } from "rxjs"
import { BusEvent, EVENT_BUS, EVENT_BUS_LISTENER, EVENT_BUS_PUSHER, HOST_NAME } from "typlib"
import { AppRoutingModule } from "./app-routing.module"
import { AppComponent } from "./app.component";
import { TestComponent } from './components/test/test.component';
import { GroupButtonsDirective } from './directives/group-buttons.directive';
import { HomeComponent } from './components/home/home.component'
import { CoreService } from "./services/core.service";
import { ProductCardComponent } from './components/product-card/product-card.component'
import { BusEventStoreService } from "./services/bus-event-store.service"
import { ScaffoldComponent } from './components/scaffold/scaffold.component';
import { CustomPreloadingStrategy } from "./core/custom-preloading-strategy"

import { GuiDirective } from "./components/_remotes/web-component-wrapper/gui.directive"
import { WebComponentWrapperComponent } from "./components/_remotes/web-component-wrapper/web-component-wrapper"
import { UserAvatarWrapperComponent } from "./components/_remotes/user-avatar-wrapper.component"
import { UserAvatarWrapperFuncComponent } from "./components/_remotes/user-avatar-wrapper-func.component"
import { UserAvatarWrapperModuleComponent } from "./components/_remotes/user-avatar-wrapper-module.component"
import { RouteTrackerService } from "./services/route-tracker.service"
import { RemoteInterceptor } from "./interceptors/remote.interceptor"
import { remoteInterceptor } from "./interceptors/remote.interceptor-func"

export function setupRouteTracker(routeTracker: RouteTrackerService) {
  return () => routeTracker.init();
}

export const initBusEvent: BusEvent = {
  event: "ADD_REMOTES",
  from: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
  to: `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`,
  payload: {}
}

export const eventBus$ = new BehaviorSubject(initBusEvent)

@NgModule({
  declarations: [
    AppComponent, 
    TestComponent,
    GroupButtonsDirective, 
    HomeComponent, 
    ProductCardComponent, 
    ScaffoldComponent,
    UserAvatarWrapperComponent,
    
    UserAvatarWrapperFuncComponent,
    UserAvatarWrapperModuleComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // HttpClientModule,
    WebComponentWrapperComponent,
    GuiDirective
  ],
  providers: [
    CustomPreloadingStrategy,
    { provide: EVENT_BUS, useValue: eventBus$ },
    {
      provide: EVENT_BUS_LISTENER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return eventBus$
          .asObservable()
          .pipe(filter((res) => res.to === `${process.env['PROJECT_ID']}@${process.env['NAMESPACE']}`));
      },
      deps: [EVENT_BUS],
    },
    {
      provide: EVENT_BUS_PUSHER,
      useFactory: (eventBus$: BehaviorSubject<BusEvent>) => {
        return (busEvent: BusEvent) => {
          eventBus$.next(busEvent);
        };
      },
      deps: [EVENT_BUS],
    },
    CoreService,
    // BusEventStoreService
    { 
      provide: HOST_NAME, 
      useValue: 'faq@web-host' 
    },
    {
      provide: 'components',
      useValue: {},
      multi: true,
    },
    // provideHttpClient(
    //   withInterceptors([remoteInterceptor])
    // ),
    provideHttpClient(
      withInterceptorsFromDi(), // Enable DI-based interceptors
      // withInterceptors([remoteInterceptor])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RemoteInterceptor,
      multi: true
    },
    // {
    //   provide: 'ROOT_HTTP_CLIENT',
    //   useFactory: (injector: Injector) => {
    //     return injector.get(HttpClient);
    //   },
    //   deps: [Injector]
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: setupRouteTracker,
      deps: [RouteTrackerService],
      multi: true
    }
  ],
  bootstrap: [AppComponent], 
})
export class AppModule {
  constructor(
    // @Inject('EVENT_BUS') private eb: BehaviorSubject<BusEvent>
  ) {
    // this.eventBus$.
    eventBus$.asObservable().subscribe(res => {
      // console.log(res)
      // console.log('MAIN HOST EVENT: ' + res.event)
      // bus.next([...bus.getValue(), res])
    })
  }
}
