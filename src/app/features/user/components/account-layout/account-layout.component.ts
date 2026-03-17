import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerService } from '../../../../core/services/customer.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CustomerDto } from '../../../../core/models';

@Component({
  selector: 'app-account-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './account-layout.component.html',
  styleUrl: './account-layout.component.scss',
})
export class AccountLayoutComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly customer = signal<CustomerDto | null>(null);
  protected readonly loading = signal(true);

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
    this.customerService.getProfile().subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
