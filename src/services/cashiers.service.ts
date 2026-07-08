import api from './api';
import type { Cashier } from '../types';

export const cashiersService = {
  async findAll(branchId?: string): Promise<Cashier[]> {
    const { data } = await api.get<Cashier[]>('/cashiers', {
      params: branchId ? { branchId } : {},
    });
    return data;
  },

  async findOne(id: string): Promise<Cashier> {
    const { data } = await api.get<Cashier>(`/cashiers/${id}`);
    return data;
  },

  async create(cashier: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    branchId: string;
    initialBalance?: number;
  }): Promise<Cashier> {
    const { data } = await api.post<Cashier>('/cashiers', cashier);
    return data;
  },

  async update(
    id: string,
    cashier: {
      branchId?: string;
      initialBalance?: number;
      isActive?: boolean;
    },
  ): Promise<Cashier> {
    const { data } = await api.patch<Cashier>(`/cashiers/${id}`, cashier);
    return data;
  },

  async toggleActive(id: string): Promise<Cashier> {
    const { data } = await api.patch<Cashier>(`/cashiers/${id}/toggle-active`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/cashiers/${id}`);
  },
};

export default cashiersService;
