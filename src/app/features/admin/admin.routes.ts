import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./components/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./components/product-form/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./components/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/category-list/category-list.component').then(
            (m) => m.CategoryListComponent,
          ),
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./components/brand-list/brand-list.component').then((m) => m.BrandListComponent),
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./components/coupon-list/coupon-list.component').then(
            (m) => m.CouponListComponent,
          ),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./components/review-moderation/review-moderation.component').then(
            (m) => m.ReviewModerationComponent,
          ),
      },
      {
        path: 'shipping',
        loadComponent: () =>
          import('./components/shipping-settings/shipping-settings.component').then(
            (m) => m.ShippingSettingsComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/users-management/users-management.component').then(
            (m) => m.UsersManagementComponent,
          ),
      },
    ],
  },
];
