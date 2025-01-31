import { Component, OnInit } from '@angular/core';
import { ChannelService } from '../../shared/services/channel.service';
import { Channel } from '../../shared/models/channel';
import { Router } from '@angular/router';
import { CommonModule, NgFor,NgForOf } from '@angular/common';
import { UserService } from '../../shared/services/user.service'; 
@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, NgFor,NgForOf], 
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css'],
})
export class ChannelListComponent implements OnInit {
  channels: Channel[] = []; 
  paginatedChannels: Channel[] = [];
  channelMembers: any[] = []; 
  selectedChannelName: string = ''; 
  users: { id: number; username: string }[] = []; 
  selectedChannelId!: number;
  userRoleMap: { [channelId: number]: string } = {};

  totalChannels = 0; 
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 1; 
  paginatedMembers: any[] = [];
  totalMembers = 0;
  memberPage = 1;
  membersPerPage = 5;
  totalMemberPages = 1;
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
        this.totalChannels = this.channels.length;
        this.totalPages = Math.ceil(this.totalChannels / this.itemsPerPage);
        this.updatePaginatedChannels();

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
  updatePaginatedChannels(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedChannels = this.channels.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedChannels();
    }
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
          this.totalChannels = this.channels.length;
          this.totalPages = Math.ceil(this.totalChannels / this.itemsPerPage);
          this.updatePaginatedChannels();
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

  viewChannelMembers(channelId: number, channelName: string): void {
    this.selectedChannelId = channelId; 
    this.selectedChannelName = channelName;
    this.channelService.getChannelMembers(channelId).subscribe(
      (members) => {
        this.channelMembers = members;
        this.selectedChannelName = channelName; 
        this.totalMembers = members.length;
        this.totalMemberPages = Math.ceil(this.totalMembers / this.membersPerPage);
        this.updatePaginatedMembers();
      },
      (error) => {
        console.error('Error fetching members:', error);
        alert('Failed to fetch channel members.');
      }
    );
  }
  updatePaginatedMembers(): void {
    const startIndex = (this.memberPage - 1) * this.membersPerPage;
    this.paginatedMembers = this.channelMembers.slice(startIndex, startIndex + this.membersPerPage);
  }

  goToMemberPage(page: number): void {
    if (page >= 1 && page <= this.totalMemberPages) {
      this.memberPage = page;
      this.updatePaginatedMembers();
    }
  }
  assignAdmin(channelId: number | undefined, userId: number): void {
    const ownerId = localStorage.getItem('userId');
    if (!ownerId || !channelId) {
      alert('Owner ID and Channel ID are required.');
      return;
    }
  
    this.channelService.assignAdmin(channelId, ownerId, userId).subscribe(
      (response) => {
        alert(response.message);
        this.viewChannelMembers(channelId, this.selectedChannelName || ''); 
      },
      (error) => {
        console.error('Error assigning admin:', error);
        const errorMessage = error.error?.message || 'Failed to promote user to admin.';
        alert(errorMessage);
      }
    );
  }
  removeAdmin(channelId: number | undefined, userId: number): void {
    const ownerId = Number(localStorage.getItem('userId'));

    if (!ownerId || !channelId) {
        alert('Owner ID and Channel ID are required.');
        return;
    }

    this.channelService.removeAdmin(channelId, ownerId, userId).subscribe(
        (response) => {
            alert(response.message);

            this.channelMembers = this.channelMembers.map((member) => {
                if (member.userId === userId) {
                    return { ...member, role: 'MEMBER' }; 
                }
                return member;
            });
        },
        (error) => {
            console.error('Error removing admin:', error);
            alert(error.error?.message || 'Failed to remove admin.');
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
        alert(response.message); 
        this.channelMembers = this.channelMembers.filter((member) => member.userId !== userId); 
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
