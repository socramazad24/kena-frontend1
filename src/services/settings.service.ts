import api from './api';

export interface Setting {
  id: string;
  roundDurationSeconds: number;
  maxNumbersPerBet: number;
  minNumbersPerBet: number;
  defaultBetValue: number;
  allowedBetValues: string[];
  initialJackpot: number;
  jackpotIncrementPercent: number;
  systemName: string;
  receiptHeader: string;
  receiptFooter: string;
  updatedAt: string;
}

export const settingsService = {
  async getSettings(): Promise<Setting> {
    const { data } = await api.get<Setting>('/settings');
    return data;
  },

  async update(settings: Partial<Setting>): Promise<Setting> {
    const { data } = await api.patch<Setting>('/settings', settings);
    return data;
  },
};

export default settingsService;
