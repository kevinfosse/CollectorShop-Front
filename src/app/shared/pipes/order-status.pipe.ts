import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus, PaymentStatus } from '../../core/models';

const ORDER_STATUS_KEYS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'PENDING',
  [OrderStatus.Confirmed]: 'CONFIRMED',
  [OrderStatus.Processing]: 'PROCESSING',
  [OrderStatus.Shipped]: 'SHIPPED',
  [OrderStatus.Delivered]: 'DELIVERED',
  [OrderStatus.Cancelled]: 'CANCELLED',
  [OrderStatus.Refunded]: 'REFUNDED',
};

const PAYMENT_STATUS_KEYS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'PENDING',
  [PaymentStatus.Authorized]: 'AUTHORIZED',
  [PaymentStatus.Captured]: 'CAPTURED',
  [PaymentStatus.Failed]: 'FAILED',
  [PaymentStatus.Refunded]: 'REFUNDED',
  [PaymentStatus.PartiallyRefunded]: 'PARTIALLY_REFUNDED',
};

@Pipe({
  name: 'orderStatusKey',
  standalone: true,
})
export class OrderStatusKeyPipe implements PipeTransform {
  transform(status: OrderStatus): string {
    return `ACCOUNT.ORDER_DETAIL.STATUS_${ORDER_STATUS_KEYS[status] ?? 'PENDING'}`;
  }
}

@Pipe({
  name: 'paymentStatusKey',
  standalone: true,
})
export class PaymentStatusKeyPipe implements PipeTransform {
  transform(status: PaymentStatus): string {
    return `ACCOUNT.ORDER_DETAIL.PAYMENT_${PAYMENT_STATUS_KEYS[status] ?? 'PENDING'}`;
  }
}

@Pipe({
  name: 'orderStatusClass',
  standalone: true,
})
export class OrderStatusClassPipe implements PipeTransform {
  transform(status: OrderStatus): string {
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
