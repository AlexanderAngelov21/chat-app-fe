export interface ChannelMember {
    role: 'OWNER' | 'ADMIN' | 'MEMBER'; // Define specific roles
    userId: number; 
    email: string; 
    username: string; 
  }
  