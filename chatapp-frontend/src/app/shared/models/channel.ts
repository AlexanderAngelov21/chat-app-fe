export interface Channel {
    id: number;
    name: string;
    owner: {
      id: number;
      username: string;
    };
    isActive: boolean;
    createdAt: string; // ISO format date
  }
  