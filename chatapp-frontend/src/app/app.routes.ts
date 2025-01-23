import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ChannelListComponent } from './components/channel-list/channel-list.component';
import { ChannelFormComponent } from './components/channel-form/channel-form.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'user-list', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'create-user', component: UserFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-user/:id', component: UserFormComponent, canActivate: [AuthGuard] },
  { path: 'channel-list', component: ChannelListComponent, canActivate: [AuthGuard] },
  { path: 'message-box', component: MessageBoxComponent , canActivate: [AuthGuard] },
  { path: 'create-channel', component: ChannelFormComponent, canActivate: [AuthGuard] },
  { path: 'edit-channel/:id', component: ChannelFormComponent, canActivate: [AuthGuard] },
  
  { path: 'friends', component: FriendListComponent, canActivate: [AuthGuard] },
{ path: 'private-messages/:receiverId', component: MessageBoxComponent, canActivate: [AuthGuard] },

  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
];
