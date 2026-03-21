import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService, ToastService } from '../../../../core/services';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);

  protected email = '';
  protected password = '';
  protected rememberMe = false;
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  protected onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.toastService.show(this.translate.instant('TOAST.LOGIN_SUCCESS'), 'success');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Login failed. Please try again.');
        this.toastService.show(this.translate.instant('TOAST.LOGIN_ERROR'), 'error');
      },
    });
  }
}
