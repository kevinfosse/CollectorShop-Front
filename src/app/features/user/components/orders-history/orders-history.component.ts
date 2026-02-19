import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { OrderService } from '../../../../core/services/order.service';
import { OrderListDto } from '../../../../core/models';
import {
  OrderStatusKeyPipe,
  OrderStatusClassPipe,
} from '../../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-orders-history',
  imports: [
    RouterLink,
    TranslateModule,
    CurrencyPipe,
    DatePipe,
    OrderStatusKeyPipe,
    OrderStatusClassPipe,
  ],
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
}
