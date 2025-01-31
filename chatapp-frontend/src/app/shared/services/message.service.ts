import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/paginated-response';
import { Message } from '../models/message';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  sendMessageToChannel(channelId: number, senderId: number, content: string): Observable<any> {
    const url = `${this.baseUrl}/channel/${channelId}?senderId=${senderId}`;
    return this.http.post(url, { content });
  }

  getMessagesFromChannel(channelId: number, page: number, size: number): Observable<PaginatedResponse<Message>> {
    const url = `http://localhost:8080/api/messages/channel/${channelId}?page=${page}&size=${size}`;
    return this.http.get<PaginatedResponse<Message>>(url);
  }

  getChannelRole(channelId: number, userId: number): Observable<'OWNER' | 'ADMIN' | 'MEMBER' | null> {
    const url = `http://localhost:8080/api/channels/${channelId}/user/${userId}/role`;
    return this.http.get<{ role: 'OWNER' | 'ADMIN' | 'MEMBER' | null }>(url).pipe(
      map(response => response.role) 
    );
  }
  getPrivateMessages(senderId: number, receiverId: number, page: number, size: number): Observable<PaginatedResponse<Message>> {
    return this.http.get<PaginatedResponse<Message>>(
      `${this.baseUrl}/friend?senderId=${senderId}&receiverId=${receiverId}&page=${page}&size=${size}`
    );
  }
  
  sendPrivateMessage(senderId: number, receiverId: number, content: string): Observable<any> {
    const url = `${this.baseUrl}/friend`;
    return this.http.post(url, { senderId, receiverId, content });
  }

  updateMessage(messageId: number, userId: number, content: string): Observable<any> {
    const url = `${this.baseUrl}/${messageId}?userId=${userId}`;
    return this.http.put(url, { content });
  }

  deleteMessage(messageId: number, userId: number): Observable<any> {
    const url = `${this.baseUrl}/${messageId}?userId=${userId}`;
    return this.http.delete(url);
  }
}
