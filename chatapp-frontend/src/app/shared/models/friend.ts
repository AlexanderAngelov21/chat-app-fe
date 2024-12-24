export interface Friend {
    id: number;
    user: {
      id: number;
      username: string;
    };
    friend: {
      id: number;
      username: string;
    };
    isActive: boolean;
    createdAt: string; // ISO format date
  }
  