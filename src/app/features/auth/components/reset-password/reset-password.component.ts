import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, ToastService } from '../../../../core/services';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected newPassword = '';
  protected confirmNewPassword = '';
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  private token = '';
  private email = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    this.email = this.route.snapshot.queryParams['email'] ?? '';

    if (!this.token || !this.email) {
      this.error.set('Invalid or expired reset link.');
    }
  }

  protected onSubmit(): void {
    if (!this.newPassword || !this.confirmNewPassword) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,
      })
      .subscribe({
        next: () => {
          this.toastService.show(this.translate.instant('TOAST.RESET_PASSWORD_SUCCESS'), 'success');
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Failed to reset password. The link may have expired.');
          this.toastService.show(this.translate.instant('TOAST.RESET_PASSWORD_ERROR'), 'error');
        },
      });
  }
}
