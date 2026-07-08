export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
