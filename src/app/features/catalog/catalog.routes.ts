import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/catalog-list/catalog-list.component').then(
        (m) => m.CatalogListComponent
      ),
  },
  {
    path: ':category',
    loadComponent: () =>
      import('./components/catalog-list/catalog-list.component').then(
        (m) => m.CatalogListComponent
      ),
  },
];
