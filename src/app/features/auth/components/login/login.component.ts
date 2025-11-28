import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div class="form-row">
            <label class="checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a routerLink="/auth/forgot-password" class="link">Forgot password?</a>
          </div>
          <button type="submit" class="btn-primary btn-lg" style="width: 100%">Sign In</button>
        </form>

        <div class="auth-card__footer">
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);

      &__header {
        text-align: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
        }

        p {
          color: #737373;
          margin: 0;
        }
      }

      &__footer {
        text-align: center;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e5e5;

        p { margin: 0; color: #737373; }
        a { color: #1a1a1a; font-weight: 500; }
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }

      input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #e5e5e5;
        border-radius: 0.5rem;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #1a1a1a;
        }
      }
    }

    .form-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .link {
      font-size: 0.875rem;
      color: #1a1a1a;
    }
  `,
})
export class LoginComponent {}
