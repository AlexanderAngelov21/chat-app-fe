import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user'; 

@Injectable({
  providedIn: 'root', 
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(searchQuery?: string): Observable<any[]> {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.set('search', searchQuery); 
    }

    return this.http.get<any[]>(this.baseUrl, { params });
  }

  // Get user by ID
  getUserById(userId: number): Observable<User> { 
    return this.http.get<User>(`${this.baseUrl}/${userId}`);
  }

  // Create a new user
  createUser(user: User): Observable<User> { 
    return this.http.post<User>(this.baseUrl, user);
  }

  // Update user
  updateUser(userId: number, userData: any): Observable<any> {
    const headers = {
      actorId: localStorage.getItem('userId') || '' 
    };
    return this.http.put(`${this.baseUrl}/${userId}`, userData, { headers });
  }

  // Soft delete user
  deleteUser(userId: number): Observable<any> {
    const headers = {
      actorId: localStorage.getItem('userId') || '' 
    };
    return this.http.delete(`${this.baseUrl}/${userId}`, { headers });
  }
}
