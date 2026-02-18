import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomerService } from '../../../../core/services/customer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomerDto } from '../../../../core/models';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly customer = signal<CustomerDto | null>(null);

  protected readonly profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: [''],
  });

  protected get initials(): string {
    const c = this.customer();
    if (c) {
      return `${c.firstName.charAt(0)}${c.lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  protected get fullName(): string {
    const c = this.customer();
    return c ? `${c.firstName} ${c.lastName}` : '';
  }

  protected get email(): string {
    return this.customer()?.email ?? '';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);
    this.customerService.getProfile().subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.profileForm.patchValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load profile');
        this.loading.set(false);
      },
    });
  }

  protected onSave(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    this.successMessage.set(null);
    this.error.set(null);

    this.customerService
      .updateProfile(
        this.profileForm.value as { firstName: string; lastName: string; phoneNumber?: string },
      )
      .subscribe({
        next: (customer) => {
          this.customer.set(customer);
          this.saving.set(false);
          this.successMessage.set('Profile updated successfully');
        },
        error: () => {
          this.error.set('Failed to update profile');
          this.saving.set(false);
        },
      });
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
