import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../shared/services/message.service';
import { AuthService } from '../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../../shared/models/message';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-box',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.css'],
})
export class MessageBoxComponent implements OnInit {
  channelId!: number | null;
  receiverId!: number | null;
  messages: Message[] = [];
  newMessage: string = '';
  userId!: number;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = +localStorage.getItem('userId')!;
    if (!this.userId) {
      console.error('User ID is not available.');
      alert('You must be logged in to access this page.');
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const channelId = params.get('channelId');
      const receiverId = params.get('receiverId');

      if (channelId) {
        this.channelId = +channelId;
        this.receiverId = null;
        this.loadChannelMessages();
        this.getUserRoleInChannel(this.channelId, this.userId);
      } else if (receiverId) {
        this.receiverId = +receiverId;
        this.channelId = null;
        this.loadPrivateMessages();
      } else {
        console.error('No valid ID provided for channel or private messaging.');
        alert('Invalid ID.');
      }
    });
  }

  // Load messages for a channel
  loadChannelMessages(): void {
    if (!this.channelId) return;

    this.messageService.getMessagesFromChannel(this.channelId).subscribe(
      (data) => {
        this.messages = data.content.map((message) => {
          return {
            ...message,
            content: this.parseContent(message.content),
          };
        });
      },
      (error) => {
        console.error('Error loading private messages:', error);
        
        const errorMessage = error.error?.message || 'Failed to load messages.';
        alert(errorMessage);
      }
    );
  }

  // Load messages for private messaging
  loadPrivateMessages(): void {
    if (!this.receiverId) return;

    this.messageService.getPrivateMessages(this.userId, this.receiverId, 0, 10).subscribe(
      (data) => {
        this.messages = data.content.map((message) => {
          return {
            ...message,
            content: this.parseContent(message.content),
          };
        });
      },
      (error) => {
        console.error('Error loading private messages:', error);

        const errorMessage = error.error?.message || 'Failed to load messages.';
        alert(errorMessage);
      }
    );
  }

  // Parse message content
  parseContent(content: any): string {
    try {
      if (typeof content === 'string' && content.startsWith('{') && content.endsWith('}')) {
        const parsed = JSON.parse(content);
        return parsed.content || content;
      }
      return content;
    } catch (e) {
      console.error('Failed to parse content:', content);
      return content;
    }
  }

  // Check if a message can be edited or deleted
  canEditOrDeleteMessage(message: Message): boolean {
    return (
      message.sender.id === this.userId || this.userRole === 'OWNER' || this.userRole === 'ADMIN'
    );
  }

  // Fetch user role in a channel
  getUserRoleInChannel(channelId: number, userId: number): void {
    this.messageService.getChannelRole(channelId, userId).subscribe(
      (role) => {
        this.userRole = role;
      },
      (error) => {
        console.error('Error fetching user role:', error);
        alert('Failed to fetch user role.');
      }
    );
  }

  // Send a message (either private or channel)
  sendMessage(): void 
  {
    
    if (!this.newMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    if (this.channelId) {
      this.messageService.sendMessageToChannel(this.channelId, this.userId, this.newMessage).subscribe(
        () => {
          this.newMessage = '';
          this.loadChannelMessages();
        },
        (error) => {
          console.error('Error sending channel message:', error);
          alert('Failed to send message.');
        }
      );
    } else if (this.receiverId) {
      this.messageService.sendPrivateMessage(this.userId, this.receiverId, this.newMessage).subscribe(
        () => {
          this.newMessage = '';
          this.loadPrivateMessages();
        },
        (error) => {
          console.error('Error sending private message:', error);
          alert('Failed to send message.');
        }
      );

    }
  }

  // Delete a message
  deleteMessage(messageId: number): void {
    this.messageService.deleteMessage(messageId, this.userId).subscribe(
      () => {
        this.messages = this.messages.filter((msg) => msg.id !== messageId);
      },
      (error) => {
        console.error('Error deleting message:', error);
        alert('Failed to delete message.');
      }
    );
  }

  // Update a message
  updateMessage(messageId: number): void {
    const updatedContent = prompt('Enter the new message content:');
    if (updatedContent) {
      this.messageService.updateMessage(messageId, this.userId, updatedContent).subscribe(
        () => {
          this.channelId ? this.loadChannelMessages() : this.loadPrivateMessages();
        },
        (error) => {
          console.error('Error updating message:', error);
          alert('Failed to update message.');
        }
      );
    }
  }
}
