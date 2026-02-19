import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { OrderService } from '../../../../core/services/order.service';
import { OrderListDto, OrderStatus } from '../../../../core/models';

@Component({
  selector: 'app-orders-history',
  imports: [RouterLink, TranslateModule, CurrencyPipe, DatePipe],
  templateUrl: './orders-history.component.html',
  styleUrl: './orders-history.component.scss',
})
export class OrdersHistoryComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<OrderListDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.orderService
      .getOrders({ pageSize: 50, sortBy: 'CreatedAt', sortDescending: true })
      .subscribe({
        next: (res) => {
          this.orders.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load orders');
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
