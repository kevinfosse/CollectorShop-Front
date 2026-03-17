import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CartService, OrderService, CustomerService, ConfigService } from '../../../core/services';
import {
  CreateOrderRequest,
  AddressDto,
  PaymentMethod,
  PaymentMethodLabels,
  CustomerAddressDto,
  OrderPreviewResponse,
} from '../../../core/models';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, CurrencyPipe, RouterLink, TranslateModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly customerService = inject(CustomerService);
  private readonly configService = inject(ConfigService);
  private readonly router = inject(Router);

  protected readonly cart = this.cartService.cart;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly savedAddresses = signal<CustomerAddressDto[]>([]);
  protected readonly orderPreview = signal<OrderPreviewResponse | null>(null);
  protected readonly previewLoading = signal(false);

  // Form fields
  protected shippingAddress: AddressDto = {
    street: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
  };

  protected billingAddress: AddressDto = {
    street: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
  };

  protected sameAsShipping = true;
  protected selectedPaymentMethod: PaymentMethod = PaymentMethod.CreditCard;
  protected couponCode = '';
  protected orderNotes = '';

  protected readonly PaymentMethod = PaymentMethod;
  protected readonly PaymentMethodLabels = PaymentMethodLabels;

  protected readonly countries = signal<{ code: string; translationKey: string }[]>([]);

  ngOnInit(): void {
    // Load countries from API
    this.configService.getShippingCountries().subscribe({
      next: (codes) =>
        this.countries.set(
          codes.map((code) => ({ code, translationKey: `CHECKOUT.COUNTRIES.${code}` })),
        ),
    });

    // Load cart if not already loaded
    if (!this.cart()) {
      this.cartService.loadCart().subscribe({
        next: () => this.loadOrderPreview(),
      });
    } else {
      this.loadOrderPreview();
    }

    // Load saved addresses
    this.customerService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        // Pre-fill with default address
        const defaultAddress = addresses.find((a) => a.isDefault && a.isShippingAddress);
        if (defaultAddress) {
          this.shippingAddress = {
            street: defaultAddress.street,
            city: defaultAddress.city,
            state: defaultAddress.state,
            country: defaultAddress.country,
            zipCode: defaultAddress.zipCode,
          };
        }
      },
      error: () => {
        // Ignore - user may not have saved addresses
      },
    });
  }

  protected selectSavedAddress(address: CustomerAddressDto): void {
    this.shippingAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
    };
  }

  protected validateCoupon(): void {
    if (!this.couponCode) return;
    this.loadOrderPreview();
  }

  protected removeCoupon(): void {
    this.couponCode = '';
    this.loadOrderPreview();
  }

  private loadOrderPreview(): void {
    this.previewLoading.set(true);
    this.orderService
      .previewOrder({
        couponCode: this.couponCode || undefined,
        shippingCountry: this.shippingAddress.country || undefined,
      })
      .subscribe({
        next: (preview) => {
          this.orderPreview.set(preview);
          this.previewLoading.set(false);
        },
        error: () => {
          this.previewLoading.set(false);
        },
      });
  }

  protected get finalTotal(): number {
    return this.orderPreview()?.total ?? this.cart()?.totalAmount ?? 0;
  }

  protected placeOrder(): void {
    if (!this.validateForm()) return;

    this.loading.set(true);
    this.error.set(null);

    const billingAddr = this.sameAsShipping ? this.shippingAddress : this.billingAddress;

    const request: CreateOrderRequest = {
      shippingAddress: this.shippingAddress,
      billingAddress: billingAddr,
      paymentMethod: this.selectedPaymentMethod,
      couponCode: this.orderPreview()?.isCouponValid ? this.couponCode : undefined,
      notes: this.orderNotes || undefined,
    };

    this.orderService.createOrder(request).subscribe({
      next: (order) => {
        this.cartService.resetCart();
        this.router.navigate(['/account/orders', order.id], {
          queryParams: { success: true },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to place order. Please try again.');
      },
    });
  }

  private validateForm(): boolean {
    if (
      !this.shippingAddress.street ||
      !this.shippingAddress.city ||
      !this.shippingAddress.zipCode
    ) {
      this.error.set('Please complete the shipping address');
      return false;
    }

    if (!this.sameAsShipping) {
      if (
        !this.billingAddress.street ||
        !this.billingAddress.city ||
        !this.billingAddress.zipCode
      ) {
        this.error.set('Please complete the billing address');
        return false;
      }
    }

    return true;
  }
}
