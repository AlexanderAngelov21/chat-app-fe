import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';
import { Channel } from '../../shared/models/channel';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, NgFor], 
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css'],
})
export class ChannelListComponent implements OnInit {
  channels: Channel[] = []; 
  channelMembers: any[] = []; 
  selectedChannelName: string = ''; 
  selectedChannelId!: number;
  constructor(private channelService: ChannelService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserChannels();
  }

  fetchUserChannels(): void {
    const userId = localStorage.getItem('userId') || '';
    if (!userId) {
      alert('User not logged in.');
      return;
    }

    this.channelService.getUserChannels(userId).subscribe(
      (data) => {
        this.channels = data;
      },
      (error) => {
        console.error('Error fetching user channels:', error);
        alert('Failed to fetch user channels.');
      }
    );
  }

  deleteChannel(channelId: number): void {
    const ownerId = localStorage.getItem('userId') || ''; // Fetch the current logged-in user's ID
    if (confirm('Are you sure you want to delete this channel?')) {
      this.channelService.deleteChannel(channelId, ownerId).subscribe(
        () => {
          this.channels = this.channels.filter((channel) => channel.id !== channelId);
          alert('Channel deleted successfully!');
        },
        (error) => {
          console.error('Error deleting channel:', error);
          const errorMessage =
            error.error?.message || 'Failed to delete channel. Please try again.';
          alert(errorMessage);
        }
      );
    }
  }
  addUserToChannel(channelId: number): void {
    const actorId = localStorage.getItem('userId'); 
    const userId = prompt('Enter the User ID to add:'); 
    if (!actorId || !userId) {
      alert('Actor ID and User ID are required.');
      return;
    }

    this.channelService.addUserToChannel(channelId, actorId, +userId).subscribe(
      () => {
        alert('User added to channel successfully!');
        this.viewChannelMembers(channelId, this.selectedChannelName || '');
      },
      (error) => {
        console.error('Error adding user to channel:', error);
        const errorMessage =
          error.error?.message || 'Failed to add user. Please try again.';
        alert(errorMessage);
      }
    );
  }
  viewChannelMembers(channelId: number, channelName: string): void {
    this.selectedChannelId = channelId; 
    this.selectedChannelName = channelName;
    this.channelService.getChannelMembers(channelId).subscribe(
      (members) => {
        this.channelMembers = members;
        this.selectedChannelName = channelName; 
      },
      (error) => {
        console.error('Error fetching members:', error);
        alert('Failed to fetch channel members.');
      }
    );
  }
  assignAdmin(channelId: number | undefined, userId: number): void {
    const ownerId = localStorage.getItem('userId');
    if (!ownerId || !channelId) {
      alert('Owner ID and Channel ID are required.');
      return;
    }
  
    this.channelService.assignAdmin(channelId, ownerId, userId).subscribe(
      (response) => {
        alert(response.message); // Display the response message
        this.viewChannelMembers(channelId, this.selectedChannelName || ''); // Refresh members
      },
      (error) => {
        console.error('Error assigning admin:', error);
        const errorMessage = error.error?.message || 'Failed to promote user to admin.';
        alert(errorMessage);
      }
    );
  }
  
  removeUser(channelId: number | undefined, userId: number): void {
    const actorId = localStorage.getItem('userId');
    if (!actorId || !channelId) {
      alert('Actor ID and Channel ID are required.');
      return;
    }
  
    this.channelService.removeUserFromChannel(channelId, actorId, userId).subscribe(
      (response) => {
        alert(response.message); // Display the response message
        this.channelMembers = this.channelMembers.filter((member) => member.userId !== userId); // Refresh members
      },
      (error) => {
        console.error('Error removing user:', error);
        const errorMessage = error.error?.message || 'Failed to remove user from channel.';
        alert(errorMessage);
      }
    );
  }
  navigateToCreateChannel(): void {
    this.router.navigate(['/create-channel']);
  }

  navigateToEditChannel(channelId: number): void {
    this.router.navigate([`/edit-channel/${channelId}`]);
  }
}
