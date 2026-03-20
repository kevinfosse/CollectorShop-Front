import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  roles: string[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(this.apiUrl);
  }

  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/roles`);
  }

  updateUserRoles(userId: string, request: UpdateUserRolesRequest): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.apiUrl}/${userId}/roles`, request);
  }

  toggleUserActive(userId: string): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.apiUrl}/${userId}/toggle-active`, {});
  }
}
