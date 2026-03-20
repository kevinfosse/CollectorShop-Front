import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  AdminUsersService,
  AdminUserDto,
} from '../../../../core/services/admin-users.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-users-management',
  imports: [DatePipe, TranslateModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss',
})
export class UsersManagementComponent implements OnInit {
  private readonly usersService = inject(AdminUsersService);
  private readonly toastService = inject(ToastService);

  protected readonly users = signal<AdminUserDto[]>([]);
  protected readonly availableRoles = signal<string[]>([]);
  protected readonly loading = signal(true);

  // Role edit modal
  protected readonly showRoleModal = signal(false);
  protected readonly editingUser = signal<AdminUserDto | null>(null);
  protected selectedRoles: Set<string> = new Set();
  protected readonly updating = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.show('TOAST.LOAD_ERROR', 'error');
        this.loading.set(false);
      },
    });

    this.usersService.getAvailableRoles().subscribe({
      next: (roles) => this.availableRoles.set(roles),
    });
  }

  protected openRoleModal(user: AdminUserDto): void {
    this.editingUser.set(user);
    this.selectedRoles = new Set(user.roles);
    this.showRoleModal.set(true);
  }

  protected toggleRole(role: string): void {
    if (this.selectedRoles.has(role)) {
      this.selectedRoles.delete(role);
    } else {
      this.selectedRoles.add(role);
    }
  }

  protected hasRole(role: string): boolean {
    return this.selectedRoles.has(role);
  }

  protected saveRoles(): void {
    const user = this.editingUser();
    if (!user) return;

    this.updating.set(true);
    this.usersService
      .updateUserRoles(user.id, { roles: Array.from(this.selectedRoles) })
      .subscribe({
        next: (updated) => {
          this.users.update((users) =>
            users.map((u) => (u.id === updated.id ? updated : u)),
          );
          this.showRoleModal.set(false);
          this.updating.set(false);
          this.toastService.show('TOAST.ROLES_UPDATED', 'success');
        },
        error: () => {
          this.updating.set(false);
          this.toastService.show('TOAST.SAVE_ERROR', 'error');
        },
      });
  }

  protected toggleActive(user: AdminUserDto): void {
    this.usersService.toggleUserActive(user.id).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((u) => (u.id === updated.id ? updated : u)),
        );
        this.toastService.show(
          updated.isActive ? 'TOAST.USER_ACTIVATED' : 'TOAST.USER_DEACTIVATED',
          'success',
        );
      },
      error: () => {
        this.toastService.show('TOAST.SAVE_ERROR', 'error');
      },
    });
  }
}
