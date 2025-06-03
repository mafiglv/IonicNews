import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({ animated: false }),
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        name: '__ionicnewsdb',
        driverOrder: ['localstorage'] 
      })
    )
  ]
};
