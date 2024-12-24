import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  token: string;
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password });
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      
      return false;
    }
    return !!localStorage.getItem('authToken');
  }

  saveAuthData(token: string, userId: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId.toString());
    }
  }

  getUserId(): number | null {
    if (typeof window === 'undefined') {
      return null; 
    }
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
    }
  }
}
