import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services';
import { RegisterRequest } from '../../../../core/models';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
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

    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters');
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
}
