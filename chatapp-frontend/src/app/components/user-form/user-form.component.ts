import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId!: number;
  existingPassword = ''; 

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
      }

      // Initialize the form
      this.initializeForm();

      if (this.isEditMode) {
        this.loadUserDetails();
      }
    });
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(6)]], 
    });
  }

  loadUserDetails(): void {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.existingPassword = user.password || ''; 
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
      });
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      console.error('Form validation failed:', this.userForm.errors, this.userForm.value);
      alert('Please fill out the form correctly.');
      return;
    }

    // Prepare the user data
    const userData: any = {
      username: this.userForm.controls['username'].value || null,
      email: this.userForm.controls['email'].value || null,
      password: this.userForm.controls['password'].value || this.existingPassword, 
    };

    if (this.isEditMode) {
      this.userService.updateUser(this.userId, userData).subscribe(
        () => {
          alert('User updated successfully.');
          this.router.navigate(['/user-list']);
        },
        (error) => {
          const errorMessage =
          error.error?.message || 'Failed to update user. Please try again.';
        alert(errorMessage); 
        }
      );
    } else {
      this.userService.createUser(userData).subscribe(
        () => {
          alert('User created successfully.');
          this.router.navigate(['/user-list']);
        },
        (error) => {
          console.error('Error creating user:', error);
          alert('Failed to create user. Please try again.');
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/user-list']);
  }
}
