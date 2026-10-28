import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiError } from '../../core/api-error';
import { API_BASE_URL } from '../../core/api.service';
import { AccountStatus } from '../../core/auth.service';

export interface AdminStats {
  total: number; pendingVerification: number; pendingApproval: number; approved: number;
  rejected: number; suspended: number; admins: number; registeredLast7Days: number;
}

export interface AdminUser {
  id: string; email: string; fullName: string; status: AccountStatus; emailConfirmed: boolean; isAdmin: boolean; isOwner: boolean;
  createdAt: string; emailVerifiedAt: string | null; approvedAt: string | null; approvedByEmail: string | null;
  statusChangedAt: string | null; statusChangedByEmail: string | null; statusReason: string | null; lastSignInAt: string | null;
}

export interface AdminUserList { items: AdminUser[]; total: number; page: number; pageSize: number; }
export interface AdminAudit { id: number; createdAt: string; actorEmail: string; action: string; targetEmail: string; details: string | null; }

export interface AdminOverview {
  stats: AdminStats; recentUsers: AdminUser[]; admins: AdminUser[]; recentActions: AdminAudit[];
  canManageAdmins: boolean; emailProvider: string;
}

export type StatusAction = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'resend-verification';

/** The admin endpoints. The server checks the role and the owner-only rules on every call. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL) + '/admin';

  overview() { return this.run(this.http.get<AdminOverview>(`${this.base}/overview`)); }

  users(query: { q?: string; status?: AccountStatus | ''; role?: string; page: number; pageSize: number }) {
    let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);
    if (query.q?.trim()) params = params.set('q', query.q.trim());
    if (query.status) params = params.set('status', query.status);
    if (query.role) params = params.set('role', query.role);
    return this.run(this.http.get<AdminUserList>(`${this.base}/users`, { params }));
  }

  user(id: string) { return this.run(this.http.get<AdminUser>(`${this.base}/users/${encodeURIComponent(id)}`)); }

  /** Reject and suspend accept an optional reason, which is shown to the user and emailed to them. */
  act(id: string, action: StatusAction, reason?: string) {
    const body = action === 'reject' || action === 'suspend' ? { reason: reason?.trim() || null } : {};
    return this.run(this.http.post<AdminUser>(`${this.base}/users/${encodeURIComponent(id)}/${action}`, body));
  }

  promote(email: string) { return this.run(this.http.post<AdminUser>(`${this.base}/admins`, { email })); }
  revoke(id: string) { return this.run(this.http.delete<AdminUser>(`${this.base}/admins/${encodeURIComponent(id)}`)); }
  audit(take = 100) { return this.run(this.http.get<AdminAudit[]>(`${this.base}/audit`, { params: { take } })); }
  testEmail() { return this.run(this.http.post<void>(`${this.base}/test-email`, {})); }

  private async run<T>(request: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch (e) {
      throw ApiError.from(e);
    }
  }
}
