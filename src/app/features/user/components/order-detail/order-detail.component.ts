import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { OrderService } from '../../../../core/services/order.service';
import { OrderDto, OrderStatus, PaymentStatus } from '../../../../core/models';
import {
  OrderStatusKeyPipe,
  OrderStatusClassPipe,
  PaymentStatusKeyPipe,
} from '../../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-order-detail',
  imports: [
    RouterLink,
    TranslateModule,
    CurrencyPipe,
    DatePipe,
    OrderStatusKeyPipe,
    OrderStatusClassPipe,
    PaymentStatusKeyPipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  protected readonly order = signal<OrderDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showSuccess = signal(false);

  readonly OrderStatus = OrderStatus;
  readonly PaymentStatus = PaymentStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    const success = this.route.snapshot.queryParamMap.get('success');
    if (success === 'true') {
      this.showSuccess.set(true);
    }

    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load order details');
        this.loading.set(false);
      },
    });
  }
}
