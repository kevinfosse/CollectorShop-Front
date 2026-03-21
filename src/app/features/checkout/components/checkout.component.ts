import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { CartService, OrderService, CustomerService, ConfigService, ToastService } from '../../../core/services';
import {
  CreateOrderRequest,
  AddressDto,
  PaymentMethod,
  PaymentMethodLabels,
  CustomerAddressDto,
  OrderPreviewResponse,
} from '../../../core/models';

interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  display: string;
}

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
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly cart = this.cartService.cart;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly savedAddresses = signal<CustomerAddressDto[]>([]);
  protected readonly orderPreview = signal<OrderPreviewResponse | null>(null);
  protected readonly previewLoading = signal(false);

  // Address autocomplete
  protected readonly addressSuggestions = signal<AddressSuggestion[]>([]);
  private readonly addressSearch$ = new Subject<string>();

  // Form fields
  protected shippingAddress: AddressDto = {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  };

  protected billingAddress: AddressDto = {
    street: '',
    city: '',
    state: '',
    country: '',
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
    // Auto-detect country from browser locale
    const detectedCountry = this.detectCountry();

    // Load countries from API
    this.configService.getShippingCountries().subscribe({
      next: (codes) => {
        this.countries.set(
          codes.map((code) => ({ code, translationKey: `CHECKOUT.COUNTRIES.${code}` })),
        );
        // Set detected country if it's in the supported list, otherwise default to first
        const country = codes.includes(detectedCountry) ? detectedCountry : codes[0] || 'US';
        if (!this.shippingAddress.country) {
          this.shippingAddress.country = country;
        }
        if (!this.billingAddress.country) {
          this.billingAddress.country = country;
        }
      },
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

    // Setup address autocomplete with debounce
    this.addressSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 3) {
            return of([]);
          }
          return this.fetchAddressSuggestions(query).pipe(catchError(() => of([])));
        }),
      )
      .subscribe((suggestions) => this.addressSuggestions.set(suggestions));
  }

  private detectCountry(): string {
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    // Extract country code from locale (e.g., 'fr-FR' -> 'FR', 'en-US' -> 'US')
    const parts = locale.split('-');
    return parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();
  }

  private fetchAddressSuggestions(query: string) {
    // Using Photon (Komoot) — free OSM-based geocoding, no API key required
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=${navigator.language?.split('-')[0] || 'en'}`;
    return this.http
      .get<{
        features: {
          properties: {
            name?: string;
            housenumber?: string;
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            countrycode?: string;
            postcode?: string;
          };
        }[];
      }>(url)
      .pipe(
        switchMap((response) => {
          const suggestions: AddressSuggestion[] = response.features
            .filter((f) => f.properties.street || f.properties.name)
            .map((f) => {
              const p = f.properties;
              const street = p.housenumber
                ? `${p.housenumber} ${p.street || p.name}`
                : (p.street || p.name || '');
              return {
                street,
                city: p.city || '',
                state: p.state || '',
                country: p.countrycode?.toUpperCase() || '',
                zipCode: p.postcode || '',
                display: [street, p.city, p.state, p.postcode, p.country]
                  .filter(Boolean)
                  .join(', '),
              };
            });
          return of(suggestions);
        }),
      );
  }

  protected onAddressInput(query: string): void {
    this.addressSearch$.next(query);
  }

  protected selectSuggestion(suggestion: AddressSuggestion): void {
    this.shippingAddress = {
      street: suggestion.street,
      city: suggestion.city,
      state: suggestion.state,
      country: suggestion.country || this.shippingAddress.country,
      zipCode: suggestion.zipCode,
    };
    this.addressSuggestions.set([]);
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
        this.toastService.show('TOAST.ORDER_PLACED', 'success');
        this.router.navigate(['/account/orders', order.id], {
          queryParams: { success: true },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to place order. Please try again.');
        this.toastService.show('TOAST.ORDER_ERROR', 'error');
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
