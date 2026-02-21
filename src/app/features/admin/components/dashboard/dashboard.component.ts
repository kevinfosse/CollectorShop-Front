import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { OrderService } from '../../../../core/services/order.service';
import { ReviewService } from '../../../../core/services/review.service';
import { CouponService } from '../../../../core/services/coupon.service';
import { OrderListDto, ReviewDto, OrderStatus } from '../../../../core/models';
import {
  OrderStatusKeyPipe,
  OrderStatusClassPipe,
} from '../../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    TranslateModule,
    OrderStatusKeyPipe,
    OrderStatusClassPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly reviewService = inject(ReviewService);
  private readonly couponService = inject(CouponService);

  protected readonly loading = signal(true);
  protected readonly totalProducts = signal(0);
  protected readonly totalOrders = signal(0);
  protected readonly totalRevenue = signal(0);
  protected readonly pendingReviews = signal(0);
  protected readonly activeCoupons = signal(0);
  protected readonly recentOrders = signal<OrderListDto[]>([]);
  protected readonly pendingReviewsList = signal<ReviewDto[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      products: this.productService.getProducts({ pageSize: 1 }),
      orders: this.orderService.getOrders({
        pageSize: 5,
        sortBy: 'createdAt',
        sortDescending: true,
      }),
      reviews: this.reviewService.getPendingReviews(),
      coupons: this.couponService.getCoupons(),
    }).subscribe({
      next: ({ products, orders, reviews, coupons }) => {
        this.totalProducts.set(products.totalCount);
        this.totalOrders.set(orders.totalCount);
        this.recentOrders.set(orders.items);
        this.pendingReviewsList.set(reviews.slice(0, 5));
        this.pendingReviews.set(reviews.length);
        this.activeCoupons.set(coupons.filter((c) => c.isActive).length);

        // Calculate revenue from delivered orders
        const revenue = orders.items
          .filter((o) => o.status === OrderStatus.Delivered)
          .reduce((sum, o) => sum + o.totalAmount, 0);
        this.totalRevenue.set(revenue);

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
