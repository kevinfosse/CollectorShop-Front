import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { OrderService } from '../../../../core/services/order.service';
import { OrderDto, OrderStatus, PaymentStatus } from '../../../../core/models';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, TranslateModule, CurrencyPipe, DatePipe],
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

  protected statusKey(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      [OrderStatus.Pending]: 'PENDING',
      [OrderStatus.Confirmed]: 'CONFIRMED',
      [OrderStatus.Processing]: 'PROCESSING',
      [OrderStatus.Shipped]: 'SHIPPED',
      [OrderStatus.Delivered]: 'DELIVERED',
      [OrderStatus.Cancelled]: 'CANCELLED',
      [OrderStatus.Refunded]: 'REFUNDED',
    };
    return `ACCOUNT.ORDER_DETAIL.STATUS_${map[status]}`;
  }

  protected paymentStatusKey(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      [PaymentStatus.Pending]: 'PENDING',
      [PaymentStatus.Authorized]: 'AUTHORIZED',
      [PaymentStatus.Captured]: 'CAPTURED',
      [PaymentStatus.Failed]: 'FAILED',
      [PaymentStatus.Refunded]: 'REFUNDED',
      [PaymentStatus.PartiallyRefunded]: 'PARTIALLY_REFUNDED',
    };
    return `ACCOUNT.ORDER_DETAIL.PAYMENT_${map[status]}`;
  }

  protected statusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Delivered:
        return 'status--success';
      case OrderStatus.Shipped:
      case OrderStatus.Processing:
      case OrderStatus.Confirmed:
        return 'status--info';
      case OrderStatus.Pending:
        return 'status--warning';
      case OrderStatus.Cancelled:
      case OrderStatus.Refunded:
        return 'status--error';
      default:
        return '';
    }
  }
}
