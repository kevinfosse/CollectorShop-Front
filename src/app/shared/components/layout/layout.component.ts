import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../navbar/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../../ui/toast/toast.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent],
  template: `
    <div class="layout">
      <app-header />
      <main class="layout__main">
        <router-outlet />
      </main>
      <app-footer />
      <app-toast />
    </div>
  `,
  styles: `
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;

      &__main {
        flex: 1;
      }
    }
  `,
})
export class LayoutComponent {}
