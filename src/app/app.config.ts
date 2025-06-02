import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(IonicStorageModule.forRoot())
  ],
};
