import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomerService } from '../../../../core/services/customer.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfigService } from '../../../../core/services/config.service';
import {
  CustomerAddressDto,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '../../../../core/models';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);
  private readonly configService = inject(ConfigService);

  // Password change
  protected readonly changingPassword = signal(false);
  protected readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', Validators.required],
  });

  // Address management
  protected readonly addresses = signal<CustomerAddressDto[]>([]);
  protected readonly loadingAddresses = signal(true);
  protected readonly savingAddress = signal(false);
  protected readonly editingAddressId = signal<string | null>(null);
  protected readonly showAddressForm = signal(false);

  protected readonly addressForm = this.fb.group({
    label: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: [''],
    country: ['', Validators.required],
    zipCode: ['', Validators.required],
    isDefault: [false],
    isBillingAddress: [true],
    isShippingAddress: [true],
  });

  protected readonly countries = signal<{ code: string; translationKey: string }[]>([]);

  ngOnInit(): void {
    this.loadAddresses();
    this.configService.getShippingCountries().subscribe({
      next: (codes) =>
        this.countries.set(
          codes.map((code) => ({ code, translationKey: `CHECKOUT.COUNTRIES.${code}` })),
        ),
    });
  }

  // ─── Password ─────────────────────────────────────────────────

  protected onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;
    if (newPassword !== confirmNewPassword) {
      this.toastService.show('SETTINGS.PASSWORDS_MISMATCH', 'error');
      return;
    }

    this.changingPassword.set(true);
    this.authService
      .changePassword({
        currentPassword: currentPassword!,
        newPassword: newPassword!,
        confirmNewPassword: confirmNewPassword!,
      })
      .subscribe({
        next: () => {
          this.toastService.show('SETTINGS.PASSWORD_CHANGED', 'success');
          this.passwordForm.reset();
          this.changingPassword.set(false);
        },
        error: () => {
          this.toastService.show('SETTINGS.PASSWORD_CHANGE_ERROR', 'error');
          this.changingPassword.set(false);
        },
      });
  }

  // ─── Addresses ────────────────────────────────────────────────

  private loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.customerService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.loadingAddresses.set(false);
      },
      error: () => {
        this.loadingAddresses.set(false);
      },
    });
  }

  protected onAddAddress(): void {
    this.editingAddressId.set(null);
    this.addressForm.reset({ isBillingAddress: true, isShippingAddress: true, isDefault: false });
    this.showAddressForm.set(true);
  }

  protected onEditAddress(address: CustomerAddressDto): void {
    this.editingAddressId.set(address.id);
    this.addressForm.patchValue({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
      isBillingAddress: address.isBillingAddress,
      isShippingAddress: address.isShippingAddress,
    });
    this.showAddressForm.set(true);
  }

  protected onCancelAddressForm(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset();
  }

  protected onSaveAddress(): void {
    if (this.addressForm.invalid) return;

    this.savingAddress.set(true);
    const formValue = this.addressForm.value;
    const editId = this.editingAddressId();

    if (editId) {
      const request: UpdateAddressRequest = {
        label: formValue.label!,
        street: formValue.street!,
        city: formValue.city!,
        state: formValue.state ?? '',
        country: formValue.country!,
        zipCode: formValue.zipCode!,
        isDefault: formValue.isDefault ?? false,
        isBillingAddress: formValue.isBillingAddress ?? true,
        isShippingAddress: formValue.isShippingAddress ?? true,
      };
      this.customerService.updateAddress(editId, request).subscribe({
        next: () => {
          this.toastService.show('SETTINGS.ADDRESS_UPDATED', 'success');
          this.closeAndReload();
        },
        error: () => {
          this.toastService.show('SETTINGS.ADDRESS_SAVE_ERROR', 'error');
          this.savingAddress.set(false);
        },
      });
    } else {
      const request: CreateAddressRequest = {
        label: formValue.label!,
        street: formValue.street!,
        city: formValue.city!,
        state: formValue.state ?? '',
        country: formValue.country!,
        zipCode: formValue.zipCode!,
        isDefault: formValue.isDefault ?? false,
        isBillingAddress: formValue.isBillingAddress ?? true,
        isShippingAddress: formValue.isShippingAddress ?? true,
      };
      this.customerService.createAddress(request).subscribe({
        next: () => {
          this.toastService.show('SETTINGS.ADDRESS_CREATED', 'success');
          this.closeAndReload();
        },
        error: () => {
          this.toastService.show('SETTINGS.ADDRESS_SAVE_ERROR', 'error');
          this.savingAddress.set(false);
        },
      });
    }
  }

  protected onDeleteAddress(address: CustomerAddressDto): void {
    this.customerService.deleteAddress(address.id).subscribe({
      next: () => {
        this.toastService.show('SETTINGS.ADDRESS_DELETED', 'success');
        this.addresses.update((list) => list.filter((a) => a.id !== address.id));
      },
      error: () => {
        this.toastService.show('SETTINGS.ADDRESS_DELETE_ERROR', 'error');
      },
    });
  }

  private closeAndReload(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
    this.savingAddress.set(false);
    this.addressForm.reset();
    this.loadAddresses();
  }
}
