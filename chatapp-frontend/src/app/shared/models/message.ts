
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
    channel?: {
      id: number;
      name: string;
    };
    content: string;
    isActive: boolean;
    createdAt: string; // ISO format date
  }
  