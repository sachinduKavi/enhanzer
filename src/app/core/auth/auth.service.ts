import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  AuthSession,
  InvalidCredentialsError,
  LoginRequest,
  LoginResponse,
} from './auth.models';

const LOGIN_API_URL = 'https://ez-staging-api.azurewebsites.net/api/External_Api/POS_Api/Invoke';
const SESSION_STORAGE_KEY = 'enhanzer.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthSession | null>(this.readStoredSession());

  readonly isAuthenticated = computed(() => this.session() !== null);

  login(email: string, password: string): Observable<AuthSession> {
    const request: LoginRequest = {
      API_Action: 'GetLoginData',
      Device_Id: 'D001',
      Sync_Time: '',
      Company_Code: email,
      API_Body: { Username: email, Pw: password },
    };

    return this.http.post<LoginResponse>(LOGIN_API_URL, request).pipe(
      map((response) => this.toSession(response)),
      tap((session) => this.storeSession(session)),
    );
  }

  // The API answers failed logins with HTTP 200, so success is decided by the
  // presence of User_Locations rather than by the status code.
  private toSession(response: LoginResponse): AuthSession {
    const user = response.Response_Body?.[0];

    if (!user?.User_Locations) {
      throw new InvalidCredentialsError();
    }

    return { email: user.Email, displayName: user.User_Display_Name ?? user.Email };
  }

  // sessionStorage is cleared when the tab closes. The password is never stored.
  private storeSession(session: AuthSession): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  private readStoredSession(): AuthSession | null {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
