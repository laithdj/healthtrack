import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule, HttpClient, } from '@angular/common/http';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { registerLocaleData } from '@angular/common';
import localeAu from '@angular/common/locales/en-AU';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import {
  API_BASE_URL,
  SingleSignOnClient,
  AssetDeviceClient,
  AssetManagementInventoryClient,
} from '../../../../Generated/CoreAPIClient';
import { environment } from '../environments/environment';
import { NotificationService } from './shared/notification-service';
import { BaseAppComponent } from './app-store/base-app.component';
import { reducers, metaReducers } from './app-store/reducers';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { AuthEffects } from './auth/auth.effects';
import { LandingComponent } from './auth/landing.component';
import { AuthenticatedGuard } from './auth/authentication.guard';
import { StompService } from './shared/stomp/stomp.service';
import { SharedModule } from './shared/shared.module';

export const GeneratedClientUrl = { provide: API_BASE_URL, useValue: environment.API_BASE_URL };

registerLocaleData(localeAu);

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    BaseAppComponent,
    AccessDeniedComponent,
    LandingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([AuthEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [
    HttpClient,
    GeneratedClientUrl,
    AssetDeviceClient,
    AssetManagementInventoryClient,
    SingleSignOnClient,
    StompService,
    NotificationService,
    AuthenticatedGuard,
    { provide: LOCALE_ID, useValue: 'en-AU' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
