import api from './api';
import type { Round } from '../types';

export const roundsService = {
  async getCurrent(): Promise<Round> {
    const { data } = await api.get<Round>('/rounds/current');
    return data;
  },

  async getTimeRemaining(): Promise<{
    roundId: string;
    roundNumber: number;
    remainingSeconds: number;
    status: string;
  }> {
    const { data } = await api.get('/rounds/current/time-remaining');
    return data;
  },

  async findAll(): Promise<Round[]> {
    const { data } = await api.get<Round[]>('/rounds');
    return data;
  },

  async findOne(id: string): Promise<Round> {
    const { data } = await api.get<Round>(`/rounds/${id}`);
    return data;
  },
};

export default roundsService;
