import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chatapp-frontend';
  constructor(private authService: AuthService, private router: Router) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    window.location.reload(); 
  }
}
