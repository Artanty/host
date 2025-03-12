import { HttpClientModule, provideHttpClient, withInterceptors } from "@angular/common/http"
import { Inject, NgModule } from "@angular/core"
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
import { authInterceptor } from "./interceptors/auth.interceptor";
import { ScaffoldComponent } from './components/scaffold/scaffold.component';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // HttpClientModule,
  ],
  providers: [
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
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
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
      console.log('MAIN HOST EVENT: ' + res.event)
      // bus.next([...bus.getValue(), res])
    })
  }
}
