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

// Helper to get status label
export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Confirmed]: 'Confirmed',
  [OrderStatus.Processing]: 'Processing',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Cancelled]: 'Cancelled',
  [OrderStatus.Refunded]: 'Refunded',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: 'Credit Card',
  [PaymentMethod.DebitCard]: 'Debit Card',
  [PaymentMethod.PayPal]: 'PayPal',
  [PaymentMethod.BankTransfer]: 'Bank Transfer',
  [PaymentMethod.CashOnDelivery]: 'Cash on Delivery',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Authorized]: 'Authorized',
  [PaymentStatus.Captured]: 'Captured',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.Refunded]: 'Refunded',
  [PaymentStatus.PartiallyRefunded]: 'Partially Refunded',
};
