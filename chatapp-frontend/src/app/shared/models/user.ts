export interface User {
    id: number;
    username: string;
    email: string;
    password?: string; 
    isActive: boolean;
    createdAt: string; 
  }
  