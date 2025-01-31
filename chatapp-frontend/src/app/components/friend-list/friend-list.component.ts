import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../shared/services/friend.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-friend-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {
  friends: any[] = [];
  paginatedFriends: any[] = [];
  userId: number = +localStorage.getItem('userId')!;

  currentPage = 1;
  itemsPerPage = 5;
  totalFriends = 0;
  totalPages = 1;
  constructor(private friendService: FriendService, private router: Router) {}

  ngOnInit(): void {
    this.loadFriends();
  }


  loadFriends(): void {
    this.friendService.getFriends(this.userId).subscribe(
      (data) => {
       this.friends = data;
        this.totalFriends = this.friends.length;
        this.totalPages = Math.ceil(this.totalFriends / this.itemsPerPage);
        this.updatePaginatedFriends();
      },
      (error) => {
        console.error('Error fetching friends:', error);
      }
    );
  }
  updatePaginatedFriends(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedFriends = [...this.friends.slice(startIndex, startIndex + this.itemsPerPage)];
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedFriends();
    }
  }
  addFriend(): void {
    const input = prompt('Enter the Friend ID to add:');
    const friendId = input ? +input : null; 
  
    if (friendId !== null && !isNaN(friendId)) { 
      this.friendService.addFriend(this.userId, friendId).subscribe(
        () => {
          this.loadFriends();
        },
        (error) => {
          console.error('Error adding friend:', error);
        }
      );
    } else {
      console.error('Invalid Friend ID entered.');
    }
  }

  deleteFriend(friendId: number): void {
    if (confirm('Are you sure you want to remove this friend?')) {
      this.friendService.deleteFriend(this.userId, friendId).subscribe(
        () => {
          this.loadFriends();
        },
        (error) => {
          console.error('Error deleting friend:', error);
        }
      );
    }
  }

 
  sendPrivateMessage(friendId: number): void {
    const content = prompt('Enter your message:');
    if (content) {
      this.friendService.sendPrivateMessage(this.userId, friendId, content).subscribe(
        () => {
          alert('Message sent!');
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  } navigateToPrivateMessages(friendId: number): void {
    this.router.navigate(['/private-messages', friendId]);
  }
}
