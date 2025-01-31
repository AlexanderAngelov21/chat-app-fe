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
  paginatedMessages: Message[] = [];
  newMessage: string = '';
  userId!: number;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalMessages = 0;
  totalPages = 1;

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
        this.loadMessages(); 
        this.getUserRoleInChannel(this.channelId, this.userId);
      } else if (receiverId) {
        this.receiverId = +receiverId;
        this.channelId = null;
        this.loadMessages(); 
      } else {
        console.error('No valid ID provided for channel or private messaging.');
        alert('Invalid ID.');
      }
    });
  }

  
  loadMessages(): void {
    if (this.channelId) {
  
      this.messageService.getMessagesFromChannel(this.channelId, this.currentPage - 1, this.itemsPerPage).subscribe(
        (data) => {
          
          this.paginatedMessages = data.content.map((message) => ({
            ...message,
            content: this.parseContent(message.content),
          }));
  
          this.totalMessages = data.totalElements;
          this.totalPages = Math.ceil(this.totalMessages / this.itemsPerPage);
        },
        (error) => {
          console.error(`❌ Error loading messages for page ${this.currentPage}:`, error);
          alert(`Failed to load messages for page ${this.currentPage}.`);
        }
      );
    } else if (this.receiverId) {
  
      this.messageService.getPrivateMessages(this.userId, this.receiverId, this.currentPage - 1, this.itemsPerPage).subscribe(
        (data) => {
          
          this.paginatedMessages = data.content.map((message) => ({
            ...message,
            content: this.parseContent(message.content),
          }));
  
          this.totalMessages = data.totalElements;
          this.totalPages = Math.ceil(this.totalMessages / this.itemsPerPage);
        },
        (error) => {
          console.error('❌ Error loading private messages:', error);
          alert('Failed to load messages.');
        }
      );
    }
  }

  
  scrollToBottom(): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.messages-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMessages();
    }
  }
  
  parseContent(content: any): string {
    try {
      if (typeof content === 'string') {
       
        if (content.startsWith('{') && content.endsWith('}')) {
          const parsed = JSON.parse(content);
          return parsed.content || content; 
        }
        return content; 
      }
      return String(content); 
    } catch (e) {
      console.error('❌ Error parsing content:', content, e);
      return content;
    }
  }
  
  
  canEditOrDeleteMessage(message: Message): boolean {
    return (
      message.sender.id === this.userId || this.userRole === 'OWNER' || this.userRole === 'ADMIN'
    );
  }


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
  sendMessage(): void {
    if (!this.newMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }
  
    const sendMessageObservable = this.channelId
      ? this.messageService.sendMessageToChannel(this.channelId, this.userId, this.newMessage)
      : this.messageService.sendPrivateMessage(this.userId, this.receiverId!, this.newMessage);
  
    sendMessageObservable.subscribe(
      () => {
        this.newMessage = '';
        this.totalMessages += 1;
        const newTotalPages = Math.ceil(this.totalMessages / this.itemsPerPage);
   
        if (newTotalPages > this.totalPages) {
          this.totalPages = newTotalPages;
          this.currentPage = this.totalPages;
        } 
        this.loadMessages();
      },
      (error) => {
        console.error('❌ Error sending message:', error);
        alert('Failed to send message.');
      }
    );
  }
  
  deleteMessage(messageId: number): void {
    this.messageService.deleteMessage(messageId, this.userId).subscribe(
      () => {
        this.totalMessages -= 1;

        const newTotalPages = Math.ceil(this.totalMessages / this.itemsPerPage);
        if (this.currentPage > newTotalPages) {
          this.currentPage = newTotalPages > 0 ? newTotalPages : 1;
        }
  
       
        this.loadMessages();
      },
      (error) => {
        console.error('❌ Error deleting message:', error);
        alert('Failed to delete message.');
      }
    );
  }
  
  
  updateMessage(messageId: number): void {
    const updatedContent = prompt('Enter the new message content:');
    if (updatedContent) {
      this.messageService.updateMessage(messageId, this.userId, updatedContent).subscribe(
        () => {
          this.loadMessages(); 
        },
        (error) => {
          console.error('Error updating message:', error);
          alert('Failed to update message.');
        }
      );
    }
  }
  
}
