export interface User {
  id: string;
  username: string;
  passwordHash: string; // demo only, normally use proper hashing & storage
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  ownerUserId: string;
}
