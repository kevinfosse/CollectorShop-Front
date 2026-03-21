import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, ToastService } from '../../../../core/services';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected email = '';
  protected loading = signal(false);
  protected sent = signal(false);

  protected onSubmit(): void {
    if (!this.email) return;

    this.loading.set(true);

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
        this.toastService.show(this.translate.instant('TOAST.FORGOT_PASSWORD_SENT'), 'success');
      },
      error: () => {
        this.loading.set(false);
        // Still show success message to not reveal if email exists
        this.sent.set(true);
        this.toastService.show(this.translate.instant('TOAST.FORGOT_PASSWORD_SENT'), 'success');
      },
    });
  }
}
