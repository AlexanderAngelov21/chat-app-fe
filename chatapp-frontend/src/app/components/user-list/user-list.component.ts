import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { NgFor } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FriendService } from '../../shared/services/friend.service';
import { ChannelService } from '../../shared/services/channel.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule,NgFor, RouterModule, CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  friends: any[] = [];
  nonFriends: any[] = [];
  searchQuery: string = ''; 
  loggedInUserId: number | null = null; 
  paginatedUsers: any[] = []; 
  currentPage: number = 1;
  itemsPerPage: number = 10; 
  totalPages: number = 1;
  selectedChannelId: number | null = null; 

  constructor(private userService: UserService,private friendService: FriendService,    private channelService: ChannelService,  private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loggedInUserId = Number(localStorage.getItem('userId'));

    this.route.paramMap.subscribe(params => {
      this.selectedChannelId = Number(params.get('channelId')) || null;
    });

    this.fetchUsersAndFriends();
  }

  fetchUsersAndFriends(): void {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.users = users; 
        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
        this.updatePaginatedUsers();
 

        this.friendService.getFriends(this.loggedInUserId!).subscribe(
          (friends) => {
            this.friends = friends;

           
            this.nonFriends = this.users.filter(
              (user) =>
                user.id !== this.loggedInUserId &&
                !this.friends.some((friend) => friend.id === user.id)
            );
          },
          (error) => {
            console.error('Error fetching friends:', error);
            alert('Failed to load friends.');
          }
        );
      },
      (error) => {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users.');
      }
    );
  }
  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedUsers();
    }
  }
  isFriend(userId: number): boolean {
    return this.friends.some((friend) => friend.id === userId);
  }
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
        this.updatePaginatedUsers();
        alert('User deleted successfully!');
      },
      (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. You do not have permission.');
      }
    );
  }
  searchUsers(): void {
    this.userService.getAllUsers(this.searchQuery).subscribe(
      (filteredUsers) => {
        this.users = filteredUsers; 
        this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
        this.updatePaginatedUsers();
      },
      (error) => {
        console.error('Error searching users:', error);
        alert('Failed to search users. Please try again.');
      }
    );
  }
  navigateToCreateUser(): void {
    this.router.navigate(['/create-user']);
  }

  navigateToEditUser(userId: number): void {
    this.router.navigate([`/edit-user/${userId}`]);
  }
  
  addFriend(friendId: number): void {
    if (this.loggedInUserId === friendId) {
      alert('You cannot add yourself as a friend.');
      return;
    }
  
    this.friendService.addFriend(this.loggedInUserId!, friendId).subscribe(
      () => {
        alert('Friend added successfully!');
        this.fetchUsersAndFriends(); 
      },
      (error) => {
        console.error('Error adding friend:', error);
        const errorMessage = error?.error?.message || 'Failed to add friend.';
        alert(errorMessage);
      }
    );
  }
  

 
  sendMessage(receiverId: number): void {
    if (!this.isFriend(receiverId)) {
      if (confirm('The user is not your friend. Do you want to add them as a friend to send a message?')) {
        this.friendService.addFriend(this.loggedInUserId!, receiverId).subscribe(
          () => {
            alert('Friend added successfully! You can now send a message.');
            this.router.navigate(['/private-messages', receiverId]); 
          },
          (error) => {
            console.error('Error adding friend:', error);
            alert('Failed to add the user as a friend. Message cannot be sent.');
          }
        );
      }
    } else {
     
      this.router.navigate(['/private-messages', receiverId]);
    }
  }
  selectUser(userId: number, username: string): void {
    if (this.selectedChannelId) {
      if (confirm(`Add ${username} to the channel?`)) {
        this.channelService.addUserToChannel(this.selectedChannelId, localStorage.getItem('userId')!, userId).subscribe(
          () => {
            alert(`${username} added to the channel successfully!`);
            this.router.navigate(['/channel-list']);
          },
          (error) => {
            console.error('Error adding user:', error);
            alert('Failed to add user to the channel.');
          }
        );
      }
    }
  }


}
