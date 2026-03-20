import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/account-layout/account-layout.component').then(
        (m) => m.AccountLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/orders-history/orders-history.component').then(
            (m) => m.OrdersHistoryComponent
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./components/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./components/wishlist/wishlist.component').then((m) => m.WishlistComponent),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./components/my-reviews/my-reviews.component').then(
            (m) => m.MyReviewsComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
