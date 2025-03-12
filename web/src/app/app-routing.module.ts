import { loadRemoteModule } from '@angular-architects/module-federation';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'test',
    component: TestComponent
  },
  // {
  //   path: 'auth',
  //   component: TestComponent
  // },
  // {
  //   path: 'faq',
  //   loadChildren: () =>
  //     loadRemoteModule({
  //       remoteName: 'faq',
  //       remoteEntry: `${process.env["FAQ_WEB_URL"]}`,
  //       exposedModule: './Module',
  //     }).then((m) => m.FaqModule),
  //   },
  //   {
  //   path: 'au',
  //   loadChildren: () =>
  //     loadRemoteModule({
  //       remoteName: 'au',
  //       remoteEntry: `${process.env["AU_WEB_URL"]}`,
  //       exposedModule: './Module',
  //     }).then((m) => m.AuthModule),
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
