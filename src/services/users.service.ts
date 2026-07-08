import api from './api';

export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const usersService = {
  async findAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async findOne(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(user: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  async toggleActive(id: string): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}/toggle-active`);
    return data;
  },
};

export default usersService;
