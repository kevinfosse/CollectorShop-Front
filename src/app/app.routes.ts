import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('./features/product-detail/product-detail.routes').then(
            (m) => m.PRODUCT_DETAIL_ROUTES,
          ),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        loadChildren: () => import('./features/user/user.routes').then((m) => m.USER_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
