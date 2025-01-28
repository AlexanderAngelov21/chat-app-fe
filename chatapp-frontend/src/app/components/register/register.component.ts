import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const userData = this.registerForm.value;

    this.http.post('http://localhost:8080/api/auth/register', userData, { responseType: 'text' }).subscribe(
      (response: string) => {
        alert(response); 
        this.router.navigate(['/login']);
      },
      (error) => {
        if (error.status === 409) {
          alert(error.error || 'Username or email already exists.');
        } else {
          console.error('Registration failed:', error);
          alert('An unexpected error occurred.');
        }
      }
    );
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
