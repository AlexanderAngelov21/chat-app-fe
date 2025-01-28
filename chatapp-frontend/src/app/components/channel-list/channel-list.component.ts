import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';
import { Channel } from '../../shared/models/channel';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { UserService } from '../../shared/services/user.service'; 
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
  users: { id: number; username: string }[] = []; 
  selectedChannelId!: number;
  userRoleMap: { [channelId: number]: string } = {};
  constructor(private channelService: ChannelService,private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserChannels();
    this.fetchAllUsers();
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
        this.channels.forEach((channel) => {
          this.getUserRoleInChannel(channel.id); 
        });
      },
      (error) => {
        console.error('Error fetching user channels:', error);
        alert('Failed to fetch user channels.');
      }
    );
  }
  getUserRoleInChannel(channelId: number): void {
    const userId = +localStorage.getItem('userId')!;
    this.channelService.getChannelMembers(channelId).subscribe((members) => {
      const user = members.find((member) => member.userId === userId);
      if (user) {
        this.userRoleMap[channelId] = user.role;
      }
    });
  }
  isOwner(channelId: number): boolean {
    return this.userRoleMap[channelId] === 'OWNER';
  }

  isOwnerOrAdmin(channelId: number): boolean {
    const role = this.userRoleMap[channelId];
    return role === 'OWNER' || role === 'ADMIN';
  }
  fetchAllUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users.');
      }
    );
  }
  deleteChannel(channelId: number): void {
    const ownerId = localStorage.getItem('userId') || ''; 
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
    const username = prompt('Enter the username to add:');
    if (!username) {
      alert('Username is required.');
      return;
    }

    const user = this.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) {
      alert('User not found.');
      return;
    }

    const actorId = localStorage.getItem('userId');
    if (!actorId) {
      alert('Actor ID is required.');
      return;
    }

    this.channelService.addUserToChannel(channelId, actorId, user.id).subscribe(
      () => {
        alert('User added to channel successfully!');
        this.viewChannelMembers(channelId, this.selectedChannelName || '');
      },
      (error) => {
        console.error('Error adding user to channel:', error);
        alert('Failed to add user. Please try again.');
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
  goToUsers() {
    this.router.navigate(['/user-list']);
  }
  viewMessages(channelId: number): void {
    this.router.navigate(['/message-box', { channelId }]);
  }
  navigateToUserList(channelId: number): void {
    this.router.navigate(['/user-list', { channelId }]);
  }
}
