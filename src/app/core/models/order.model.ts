// Order DTOs matching the C# backend

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5,
  Refunded = 6,
}

export enum PaymentMethod {
  CreditCard = 0,
  DebitCard = 1,
  PayPal = 2,
  BankTransfer = 3,
  CashOnDelivery = 4,
}

export enum PaymentStatus {
  Pending = 0,
  Authorized = 1,
  Captured = 2,
  Failed = 3,
  Refunded = 4,
  PartiallyRefunded = 5,
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  subTotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  couponCode?: string;
  notes?: string;
  items: OrderItemDto[];
  payment?: PaymentDto;
  shipment?: ShipmentDto;
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

export interface OrderListDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: Date;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentDto {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
}

export interface ShipmentDto {
  id: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  shippedAt: Date;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CreateOrderRequest {
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface ShipOrderRequest {
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate?: Date;
}

export interface OrderFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  customerId?: string;
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface OrderPreviewRequest {
  couponCode?: string;
  shippingCountry?: string;
}

export interface OrderPreviewResponse {
  subTotal: number;
  shippingCost: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  couponMessage?: string;
  isCouponValid: boolean;
}

// Translation keys for status labels
export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'ACCOUNT.ORDER_DETAIL.STATUS_PENDING',
  [OrderStatus.Confirmed]: 'ACCOUNT.ORDER_DETAIL.STATUS_CONFIRMED',
  [OrderStatus.Processing]: 'ACCOUNT.ORDER_DETAIL.STATUS_PROCESSING',
  [OrderStatus.Shipped]: 'ACCOUNT.ORDER_DETAIL.STATUS_SHIPPED',
  [OrderStatus.Delivered]: 'ACCOUNT.ORDER_DETAIL.STATUS_DELIVERED',
  [OrderStatus.Cancelled]: 'ACCOUNT.ORDER_DETAIL.STATUS_CANCELLED',
  [OrderStatus.Refunded]: 'ACCOUNT.ORDER_DETAIL.STATUS_REFUNDED',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: 'COMMON.PAYMENT_METHODS.CREDIT_CARD',
  [PaymentMethod.DebitCard]: 'COMMON.PAYMENT_METHODS.DEBIT_CARD',
  [PaymentMethod.PayPal]: 'COMMON.PAYMENT_METHODS.PAYPAL',
  [PaymentMethod.BankTransfer]: 'COMMON.PAYMENT_METHODS.BANK_TRANSFER',
  [PaymentMethod.CashOnDelivery]: 'COMMON.PAYMENT_METHODS.CASH_ON_DELIVERY',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_PENDING',
  [PaymentStatus.Authorized]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_AUTHORIZED',
  [PaymentStatus.Captured]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_CAPTURED',
  [PaymentStatus.Failed]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_FAILED',
  [PaymentStatus.Refunded]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_REFUNDED',
  [PaymentStatus.PartiallyRefunded]: 'ACCOUNT.ORDER_DETAIL.PAYMENT_PARTIALLY_REFUNDED',
};
