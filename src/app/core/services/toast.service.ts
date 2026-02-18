import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  icon: string;
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: 'pi pi-check-circle',
  error: 'pi pi-times-circle',
  info: 'pi pi-info-circle',
  warning: 'pi pi-exclamation-triangle',
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success', duration = 3000): void {
    const toast: Toast = {
      id: ++this.nextId,
      message,
      type,
      icon: TOAST_ICONS[type],
    };

    this.toasts.update((list) => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
