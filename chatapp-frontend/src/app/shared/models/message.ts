import { Channel } from './channel';
export interface Message {
    id: number;
    sender: {
      id: number;
      username: string;
    };
    receiver?: {
      id: number;
      username: string;
    };
    channel?: Channel;
    content: string;
    isActive: boolean;
    createdAt: string; // ISO format date
  }
  