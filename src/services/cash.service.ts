import api from './api';
import type {
    CashSession,
    CashBalance,
    OpenCashPayload,
    CloseCashPayload,
} from '../types';

export const cashService = {
  async open(payload: OpenCashPayload): Promise<CashSession> {
    const { data } = await api.post<CashSession>('/cash/open', payload);
    return data;
  },

  async close(sessionId: string, payload: CloseCashPayload): Promise<CashSession> {
    const { data } = await api.post<CashSession>(`/cash/close/${sessionId}`, payload);
    return data;
  },

  async findAll(): Promise<CashSession[]> {
    const { data } = await api.get<CashSession[]>('/cash/sessions');
    return data;
  },

  async findOne(id: string): Promise<CashSession> {
    const { data } = await api.get<CashSession>(`/cash/sessions/${id}`);
    return data;
  },

  async getBalance(sessionId: string): Promise<CashBalance> {
    const { data } = await api.get<CashBalance>(`/cash/sessions/${sessionId}/balance`);
    return data;
  },

  async getMyActive(): Promise<CashSession | null> {
    try {
      const { data } = await api.get<CashSession | null>('/cash/my-active');
      return data;
    } catch {
      return null;
    }
  },
};

export default cashService;
