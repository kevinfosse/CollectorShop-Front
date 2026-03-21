import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
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
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected readonly order = signal<OrderDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showSuccess = signal(false);
  protected readonly cancelling = signal(false);

  readonly OrderStatus = OrderStatus;
  readonly PaymentStatus = PaymentStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    const success = this.route.snapshot.queryParamMap.get('success');
    if (success === 'true') {
      this.showSuccess.set(true);
    }

    this.loadOrder(id);
  }

  private loadOrder(id: string): void {
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

  protected get canCancel(): boolean {
    const status = this.order()?.status;
    return status === OrderStatus.Pending || status === OrderStatus.Confirmed;
  }

  protected onCancelOrder(): void {
    const order = this.order();
    if (!order) return;

    const confirmMsg = this.translate.instant('ACCOUNT.ORDER_DETAIL.CANCEL_CONFIRM');
    if (!confirm(confirmMsg)) return;

    this.cancelling.set(true);
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.loadOrder(order.id);
        this.cancelling.set(false);
        this.toastService.show(this.translate.instant('TOAST.ORDER_CANCELLED'), 'success');
      },
      error: () => {
        this.cancelling.set(false);
        this.toastService.show(this.translate.instant('TOAST.ORDER_CANCEL_ERROR'), 'error');
      },
    });
  }
}
