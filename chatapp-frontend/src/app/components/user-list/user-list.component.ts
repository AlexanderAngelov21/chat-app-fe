import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { NgFor } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule,NgFor, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  searchQuery: string = ''; 
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe((data) => {
      this.users = data;
    });
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
}
