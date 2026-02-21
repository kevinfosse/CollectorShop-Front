import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { OrderListDto, OrderFilterRequest, OrderStatus } from '../../../../core/models';
import {
  OrderStatusKeyPipe,
  OrderStatusClassPipe,
} from '../../../../shared/pipes/order-status.pipe';

@Component({
  selector: 'app-admin-order-list',
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    TranslateModule,
    OrderStatusKeyPipe,
    OrderStatusClassPipe,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  protected readonly orders = signal<OrderListDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 15;

  protected readonly statuses = Object.values(OrderStatus).filter(
    (v) => typeof v === 'number',
  ) as OrderStatus[];

  protected selectedStatus: OrderStatus | '' = '';
  protected fromDate = '';
  protected toDate = '';

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    const filter: OrderFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      status: this.selectedStatus !== '' ? this.selectedStatus : undefined,
      fromDate: this.fromDate ? new Date(this.fromDate) : undefined,
      toDate: this.toDate ? new Date(this.toDate) : undefined,
      sortBy: 'createdAt',
      sortDescending: true,
    };

    this.orderService.getOrders(filter).subscribe({
      next: (res) => {
        this.orders.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load orders', 'error');
        this.loading.set(false);
      },
    });
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrders();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }
}
