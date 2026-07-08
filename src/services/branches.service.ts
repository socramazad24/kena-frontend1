import api from './api';
import type { Branch } from '../types';

export const branchesService = {
  async findAll(): Promise<Branch[]> {
    const { data } = await api.get<Branch[]>('/branches');
    return data;
  },

  async findActive(): Promise<Branch[]> {
    const { data } = await api.get<Branch[]>('/branches/active');
    return data;
  },

  async findOne(id: string): Promise<Branch> {
    const { data } = await api.get<Branch>(`/branches/${id}`);
    return data;
  },

  async create(branch: {
    code: string;
    name: string;
    address?: string;
    phone?: string;
  }): Promise<Branch> {
    const { data } = await api.post<Branch>('/branches', branch);
    return data;
  },

  async update(id: string, branch: Partial<Branch>): Promise<Branch> {
    const { data } = await api.patch<Branch>(`/branches/${id}`, branch);
    return data;
  },

  async toggleActive(id: string): Promise<Branch> {
    const { data } = await api.patch<Branch>(`/branches/${id}/toggle-active`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};

export default branchesService;
