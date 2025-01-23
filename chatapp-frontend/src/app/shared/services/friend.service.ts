import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  
  getFriends(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/friends/${userId}`);
  }

  
  addFriend(userId: number, friendId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/friends`, { userId, friendId, active: true });
  }

  
  deleteFriend(userId: number, friendId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/friends`, {
      params: { userId: userId.toString(), friendId: friendId.toString() },
      responseType: 'text', 
    });
  }

  
  sendPrivateMessage(senderId: number, receiverId: number, content: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/messages/friend`, { senderId, receiverId, content });
  }

  
  deletePrivateMessage(messageId: number, senderId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/messages/friend/${messageId}?senderId=${senderId}`);
  }

 
  updatePrivateMessage(messageId: number, senderId: number, content: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/messages/friend/${messageId}`, { senderId, content });
  }

  
  getPrivateMessages(senderId: number, receiverId: number, page: number, size: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/messages/friend?senderId=${senderId}&receiverId=${receiverId}&page=${page}&size=${size}`
    );
  }
}
