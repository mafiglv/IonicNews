import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then(m => m.SettingsPage)
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.page').then(m => m.HistoryPage)
  }
];
