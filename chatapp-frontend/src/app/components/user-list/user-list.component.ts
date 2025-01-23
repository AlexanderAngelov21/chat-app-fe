import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FriendService } from '../../shared/services/friend.service';

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
  constructor(private userService: UserService,private friendService: FriendService,  private router: Router) {}

  ngOnInit(): void {
    this.fetchUsersAndFriends();
    this.loggedInUserId = Number(localStorage.getItem('userId'));
  }

  fetchUsersAndFriends(): void {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.users = users;

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
  isFriend(userId: number): boolean {
    return this.friends.some((friend) => friend.id === userId);
  }
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      () => {
        this.users = this.users.filter((user) => user.id !== userId);
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
        this.fetchUsersAndFriends(); // Refresh the user and friends list
      },
      (error) => {
        console.error('Error adding friend:', error);
        const errorMessage = error?.error?.message || 'Failed to add friend.';
        alert(errorMessage);
      }
    );
  }
  

 
  sendMessage(receiverId: number): void {
    this.router.navigate(['/private-messages', receiverId]);
}
}
