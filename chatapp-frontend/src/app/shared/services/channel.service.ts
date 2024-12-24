import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel';


@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private baseUrl = 'http://localhost:8080/api/channels';

  constructor(private http: HttpClient) {}

  getAllChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.baseUrl);
  }

  getChannelById(channelId: number): Observable<Channel> {
    return this.http.get<Channel>(`${this.baseUrl}/${channelId}`);
  }

  createChannel(channel: { channelName: string; ownerId: string }): Observable<Channel> {
    return this.http.post<Channel>(this.baseUrl, channel);
  }

  updateChannel(channelId: number, userId: string, newChannelName: string): Observable<any> {
    const url = `${this.baseUrl}/${channelId}/user/${userId}?newName=${encodeURIComponent(newChannelName)}`;
    return this.http.put(url, null); 
  }
  

  deleteChannel(channelId: number, ownerId: string): Observable<void> {
    const url = `${this.baseUrl}/${channelId}/owner/${ownerId}`;
    return this.http.delete<void>(url);
  }
  addUserToChannel(channelId: number, actorId: string, userId: number): Observable<void> {
    const params = new HttpParams()
      .set('actorId', actorId)
      .set('userId', userId.toString());
    return this.http.post<void>(`${this.baseUrl}/${channelId}/addUser`, null, { params}); 
  }
  getUserChannels(userId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.baseUrl}/user/${userId}/channels`);
  }
  getChannelMembers(channelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${channelId}/members`);
  }
  assignAdmin(channelId: number, ownerId: string, userId: number): Observable<{ message: string }> {
    const url = `${this.baseUrl}/${channelId}/assignAdmin`;
    const params = new HttpParams().set('ownerId', ownerId).set('userId', userId.toString());
    return this.http.put<{ message: string }>(url, null, { params });
  }

  removeUserFromChannel(channelId: number, actorId: string, userId: number): Observable<{ message: string }> {
    const url = `${this.baseUrl}/${channelId}/removeUser`;
    const params = new HttpParams().set('actorId', actorId).set('userId', userId.toString());
    return this.http.delete<{ message: string }>(url, { params });
  }
  
}
