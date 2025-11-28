import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  template: `
    <div class="account section">
      <div class="container">
        <div class="account__layout">
          <!-- Sidebar -->
          <aside class="account__sidebar">
            <div class="user-info">
              <div class="user-info__avatar">JD</div>
              <h3 class="user-info__name">John Doe</h3>
              <p class="user-info__email">john@example.com</p>
            </div>
            <nav class="account-nav">
              <a routerLink="/account" class="account-nav__link active">
                <i class="pi pi-user"></i> My Profile
              </a>
              <a routerLink="/account/orders" class="account-nav__link">
                <i class="pi pi-box"></i> Orders
              </a>
              <a routerLink="/account/wishlist" class="account-nav__link">
                <i class="pi pi-heart"></i> Wishlist
              </a>
              <a routerLink="/account/settings" class="account-nav__link">
                <i class="pi pi-cog"></i> Settings
              </a>
              <button class="account-nav__link logout">
                <i class="pi pi-sign-out"></i> Sign Out
              </button>
            </nav>
          </aside>

          <!-- Main Content -->
          <main class="account__main">
            <h1>My Profile</h1>
            <div class="profile-card">
              <h2>Personal Information</h2>
              <form class="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name</label>
                    <input type="text" value="John" />
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" value="Doe" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" value="john@example.com" />
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <button type="submit" class="btn-primary">Save Changes</button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: `
    .account__layout {
      display: grid;
      gap: 2rem;

      @media (min-width: 1024px) {
        grid-template-columns: 280px 1fr;
      }
    }

    .account__sidebar {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      height: fit-content;
    }

    .user-info {
      text-align: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e5e5e5;
      margin-bottom: 1.5rem;

      &__avatar {
        width: 80px;
        height: 80px;
        background: #1a1a1a;
        color: #c9a962;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 auto 1rem;
      }

      &__name {
        margin: 0;
        font-size: 1.125rem;
      }

      &__email {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: #737373;
      }
    }

    .account-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &__link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        color: #525252;
        font-size: 0.9375rem;
        transition: all 0.2s;
        border: none;
        background: none;
        cursor: pointer;
        width: 100%;
        text-align: left;

        &:hover, &.active {
          background: #f5f5f5;
          color: #1a1a1a;
        }

        &.logout {
          color: #ef4444;
          margin-top: 1rem;
          &:hover { background: #fef2f2; }
        }
      }
    }

    .account__main {
      h1 { margin: 0 0 1.5rem; }
    }

    .profile-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;

      h2 {
        font-size: 1.125rem;
        margin: 0 0 1.5rem;
      }
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

        &:focus { outline: none; border-color: #1a1a1a; }
      }
    }
  `,
})
export class ProfileComponent {}
