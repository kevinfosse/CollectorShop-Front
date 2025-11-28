import { Routes } from '@angular/router';

export const PRODUCT_DETAIL_ROUTES: Routes = [
  {
    path: ':slug',
    loadComponent: () =>
      import('./components/product-detail.component').then((m) => m.ProductDetailComponent),
  },
];
