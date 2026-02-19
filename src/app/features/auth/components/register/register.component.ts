import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services';
import { RegisterRequest, PasswordPolicyResponse } from '../../../../core/models';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected firstName = '';
  protected lastName = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected agreeToTerms = false;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  private passwordPolicy: PasswordPolicyResponse | null = null;

  ngOnInit(): void {
    this.authService.getPasswordPolicy().subscribe({
      next: (policy) => (this.passwordPolicy = policy),
    });
  }

  protected onSubmit(): void {
    if (
      !this.firstName ||
      !this.lastName ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    const passwordErrors = this.validatePassword(this.password);
    if (passwordErrors.length > 0) {
      this.error.set(passwordErrors.join('. '));
      return;
    }

    if (!this.agreeToTerms) {
      this.error.set('You must agree to the Terms of Service');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Registration failed. Please try again.');
      },
    });
  }

  private validatePassword(password: string): string[] {
    const errors: string[] = [];
    const policy = this.passwordPolicy;

    // Use server policy if available, otherwise fall back to safe defaults
    const minLength = policy?.minLength ?? 8;
    const requireUppercase = policy?.requireUppercase ?? true;
    const requireLowercase = policy?.requireLowercase ?? true;
    const requireDigit = policy?.requireDigit ?? true;
    const requireNonAlphanumeric = policy?.requireNonAlphanumeric ?? true;

    if (password.length < minLength)
      errors.push(`Password must be at least ${minLength} characters`);
    if (requireUppercase && !/[A-Z]/.test(password))
      errors.push('Password must contain at least one uppercase letter');
    if (requireLowercase && !/[a-z]/.test(password))
      errors.push('Password must contain at least one lowercase letter');
    if (requireDigit && !/[0-9]/.test(password))
      errors.push('Password must contain at least one digit');
    if (requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(password))
      errors.push('Password must contain at least one special character');
    return errors;
  }
}
