import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { CartDto } from '../models';
import { environment } from '../../../environments/environment';

const mockCart: CartDto = {
  id: 'cart-1',
  customerId: 'customer-1',
  items: [
    {
      id: 'item-1',
      productId: 'prod-abc',
      productName: 'Vintage Comic',
      productSku: 'SKU-001',
      quantity: 2,
      unitPrice: 25,
      totalPrice: 50,
      currency: 'EUR',
      availableStock: 5,
    },
  ],
  totalAmount: 50,
  currency: 'EUR',
  totalItems: 2,
};

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty state by default', () => {
    expect(service.cart()).toBeNull();
    expect(service.isEmpty()).toBe(true);
    expect(service.itemCount()).toBe(0);
    expect(service.totalAmount()).toBe(0);
    expect(service.loading()).toBe(false);
  });

  it('should update computed signals after loadCart', () => {
    service.loadCart().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/cart`).flush(mockCart);

    expect(service.isEmpty()).toBe(false);
    expect(service.itemCount()).toBe(2);
    expect(service.totalAmount()).toBe(50);
  });

  it('should return 0 for getCartQuantity when cart is empty', () => {
    expect(service.getCartQuantity('prod-abc')).toBe(0);
  });

  it('should return correct quantity for a product in cart', () => {
    service.loadCart().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/cart`).flush(mockCart);

    expect(service.getCartQuantity('prod-abc')).toBe(2);
    expect(service.getCartQuantity('other-prod')).toBe(0);
  });

  it('should clear cart state on resetCart', () => {
    service.loadCart().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/cart`).flush(mockCart);
    expect(service.isEmpty()).toBe(false);

    service.resetCart();

    expect(service.cart()).toBeNull();
    expect(service.isEmpty()).toBe(true);
  });

  it('should handle 404 gracefully in loadCart treating it as empty cart', () => {
    service.loadCart().subscribe();
    httpMock
      .expectOne(`${environment.apiUrl}/cart`)
      .flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(service.cart()).toBeNull();
    expect(service.loading()).toBe(false);
  });
});
