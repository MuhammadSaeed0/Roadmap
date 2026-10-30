interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
  lastLogin?: string;
}

const users: User[] = [
  { id: 1, name: "Sara", email: "sara@example.com", active: true, lastLogin: "2026-10-01" },
  { id: 2, name: "Omar", email: "omar@example.com", active: false },
  { id: 3, name: "Mona", email: "mona@example.com", active: true, lastLogin: "2026-09-12" },
];

function activeUserNames(users: User[]): string[] {
  return users.filter(u => u.active).map(u => u.name).sort();
}

function neverLoggedIn(users: User[]): User[] {
  return users.filter(u => !u.lastLogin);
}
