import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  OrderDto,
  OrderStatus,
  ShipOrderRequest,
  UpdateOrderStatusRequest,
} from '../../../../core/models';
import {
  OrderStatusKeyPipe,
  OrderStatusClassPipe,
  PaymentStatusKeyPipe,
} from '../../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-admin-order-detail',
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    TranslateModule,
    OrderStatusKeyPipe,
    OrderStatusClassPipe,
    PaymentStatusKeyPipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  protected readonly order = signal<OrderDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly updating = signal(false);

  // Status update
  protected readonly showStatusModal = signal(false);
  protected newStatus: OrderStatus = OrderStatus.Confirmed;

  protected openStatusModal(): void {
    const next = this.allowedNextStatuses;
    if (next.length > 0) {
      this.newStatus = next[0];
    }
    this.showStatusModal.set(true);
  }
  protected statusNote = '';

  // Ship order
  protected readonly showShipModal = signal(false);
  protected trackingNumber = '';
  protected carrier = '';
  protected estimatedDelivery = '';

  protected readonly OrderStatus = OrderStatus;

  // Valid status transitions based on domain rules
  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.Pending]: [OrderStatus.Confirmed],
    [OrderStatus.Confirmed]: [OrderStatus.Processing],
    [OrderStatus.Processing]: [], // Use "Ship Order" button instead
    [OrderStatus.Shipped]: [OrderStatus.Delivered],
    [OrderStatus.Delivered]: [],
    [OrderStatus.Cancelled]: [],
    [OrderStatus.Refunded]: [],
  };

  protected get allowedNextStatuses(): OrderStatus[] {
    const current = this.order()?.status;
    if (current == null) return [];
    return this.validTransitions[current] ?? [];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadOrder(id);
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load order', 'error');
        this.router.navigate(['/admin/orders']);
      },
    });
  }

  protected onUpdateStatus(): void {
    const order = this.order();
    if (!order) return;

    this.updating.set(true);
    const request: UpdateOrderStatusRequest = {
      status: this.newStatus,
      notes: this.statusNote || undefined,
    };

    this.orderService.updateOrderStatus(order.id, request).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.showStatusModal.set(false);
        this.statusNote = '';
        this.updating.set(false);
        this.toastService.show('Order status updated', 'success');
      },
      error: () => {
        this.updating.set(false);
        this.toastService.show('Failed to update status', 'error');
      },
    });
  }

  protected onShipOrder(): void {
    const order = this.order();
    if (!order) return;

    this.updating.set(true);
    const request: ShipOrderRequest = {
      trackingNumber: this.trackingNumber,
      carrier: this.carrier,
      estimatedDeliveryDate: this.estimatedDelivery ? new Date(this.estimatedDelivery) : undefined,
    };

    this.orderService.shipOrder(order.id, request).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.showShipModal.set(false);
        this.trackingNumber = '';
        this.carrier = '';
        this.estimatedDelivery = '';
        this.updating.set(false);
        this.toastService.show('Order shipped successfully', 'success');
      },
      error: () => {
        this.updating.set(false);
        this.toastService.show('Failed to ship order', 'error');
      },
    });
  }

  protected onCancelOrder(): void {
    const order = this.order();
    if (!order) return;

    const reason = prompt('Cancel reason (optional):');
    if (reason === null) return;

    this.updating.set(true);
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.loadOrder(order.id);
        this.updating.set(false);
        this.toastService.show('Order cancelled', 'success');
      },
      error: () => {
        this.updating.set(false);
        this.toastService.show('Failed to cancel order', 'error');
      },
    });
  }
}
