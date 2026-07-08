import api from './api';

export interface PrizeRule {
  id: string;
  name: string;
  numbersPlayed: number;
  hitsRequired: number;
  prizeType: 'fixed' | 'multiplier' | 'jackpot';
  multiplier: number;
  fixedAmount: number;
  isActive?: boolean;  // ← Ahora es opcional
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export const prizesService = {
  async findAll(): Promise<PrizeRule[]> {
    const { data } = await api.get<PrizeRule[]>('/prizes/rules');
    return data;
  },

  async findActive(): Promise<PrizeRule[]> {
    const { data } = await api.get<PrizeRule[]>('/prizes/rules/active');
    return data;
  },

  async create(
    rule: Omit<PrizeRule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PrizeRule> {
    const { data } = await api.post<PrizeRule>('/prizes/rules', {
      ...rule,
      isActive: rule.isActive ?? true,
    });
    return data;
  },

  async update(
    id: string,
    rule: Partial<PrizeRule>,
  ): Promise<PrizeRule> {
    const { data } = await api.patch<PrizeRule>(`/prizes/rules/${id}`, rule);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/prizes/rules/${id}`);
  },
};

export default prizesService;
