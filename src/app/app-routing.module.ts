import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [{
  path: 'profile',
  component: ProfileComponent,
  canActivate: [MsalGuard]
}];

const isIframe = window !== window.parent && !window.opener;

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: !isIframe ? 'enabledBlocking' : 'disabled' // Don't perform initial navigation in iframes
  })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
