import api from './api';
import type { Ticket, TicketStatus } from '../types';

export interface DailySales {
  date: string;
  totalTickets: number;
  totalSales: number;
  averageTicket: number;
}

export interface PaidPrizes {
  date: string;
  totalPaid: number;
  totalAmount: number;
}

export interface CashierBalance {
  sessionId: string;
  cashierName: string;
  username: string;
  initialAmount: number;
  totalSales: number;
  totalPrizes: number;
  finalAmount: number | null;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  currentBalance: number;
}

export interface BranchReport {
  branchId: string;
  branchCode: string;
  branchName: string;
  totalTickets: number;
  totalSales: number;
  totalPrizes: number;
  profit: number;
}

export interface DailyProfit {
  date: string;
  totalSales: number;
  totalPrizes: number;
  profit: number;
  margin: number;
}

export interface DashboardData {
  date: string;
  sales: DailySales;
  prizes: PaidPrizes;
  profit: DailyProfit;
  byBranch: BranchReport[];
}

export const reportsService = {
  async getDashboard(date?: string): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/reports/dashboard', {
      params: date ? { date } : {},
    });
    return data;
  },

  async getDailySales(date?: string): Promise<DailySales> {
    const { data } = await api.get<DailySales>('/reports/sales/daily', {
      params: date ? { date } : {},
    });
    return data;
  },

  async getPaidPrizes(date?: string): Promise<PaidPrizes> {
    const { data } = await api.get<PaidPrizes>('/reports/prizes/paid', {
      params: date ? { date } : {},
    });
    return data;
  },

  async getDailyProfit(date?: string): Promise<DailyProfit> {
    const { data } = await api.get<DailyProfit>('/reports/profit/daily', {
      params: date ? { date } : {},
    });
    return data;
  },

  async getBalanceByCashier(
    cashierId?: string,
    date?: string,
  ): Promise<CashierBalance[]> {
    const { data } = await api.get<CashierBalance[]>(
      '/reports/cashiers/balance',
      {
        params: { cashierId, date },
      },
    );
    return data;
  },

  async getByBranch(
    branchId?: string,
    date?: string,
  ): Promise<BranchReport[]> {
    const { data } = await api.get<BranchReport[]>('/reports/branches', {
      params: { branchId, date },
    });
    return data;
  },

  async getBetsHistory(filters: {
    branchId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
    status?: TicketStatus;
    limit?: number;
  }): Promise<Ticket[]> {
    const { data } = await api.get<Ticket[]>('/reports/bets/history', {
      params: filters,
    });
    return data;
  },
};

export default reportsService;
