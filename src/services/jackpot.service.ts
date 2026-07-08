import api from './api';

export interface Jackpot {
  id: string;
  currentAmount: number;
  baseAmount: number;
  incrementPercent: number;
  winningNumbersCount: number;
  roundsWithoutWinner: number;
  createdAt: string;
  updatedAt: string;
}

export interface JackpotHistoryEntry {
  id: string;
  jackpotId: string;
  type: 'increment' | 'reset' | 'won' | 'manual';
  amount: number;
  previousAmount: number;
  newAmount: number;
  description: string;
  createdAt: string;
}

export const jackpotService = {
  async getCurrent(): Promise<Jackpot> {
    const { data } = await api.get<Jackpot>('/jackpot');
    return data;
  },

  async getHistory(limit: number = 50): Promise<JackpotHistoryEntry[]> {
    const { data } = await api.get<JackpotHistoryEntry[]>('/jackpot/history', {
      params: { limit },
    });
    return data;
  },

  async updateConfig(config: {
    baseAmount?: number;
    incrementPercent?: number;
    winningNumbersCount?: number;
  }): Promise<Jackpot> {
    const { data } = await api.patch<Jackpot>('/jackpot', config);
    return data;
  },
};

export default jackpotService;
