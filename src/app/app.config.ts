import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { Storage } from '@ionic/storage-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes),
  {
      provide: Storage,
        useFactory: () => {
        const storage = new Storage();
        storage.create();
        return storage;
      }
    }
  ]
};