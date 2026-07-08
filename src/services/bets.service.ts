import api from './api';
import type { Ticket, SoldNumber, CreateTicketPayload } from '../types';

export const betsService = {
  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    const { data } = await api.post<Ticket>('/bets/tickets', payload);
    return data;
  },

  async findAll(filters?: {
    branchId?: string;
    roundId?: string;
  }): Promise<Ticket[]> {
    const { data } = await api.get<Ticket[]>('/bets/tickets', {
      params: filters,
    });
    return data;
  },

  async findByCode(code: string): Promise<Ticket> {
    const { data } = await api.get<Ticket>(`/bets/tickets/code/${code}`);
    return data;
  },

  async findById(id: string): Promise<Ticket> {
    const { data } = await api.get<Ticket>(`/bets/tickets/${id}`);
    return data;
  },

  async getSoldNumbers(roundId: string): Promise<SoldNumber[]> {
    const { data } = await api.get<SoldNumber[]>(
      `/bets/sold-numbers/${roundId}`,
    );
    return data;
  },

  async getWinnersByRound(roundId: string): Promise<Ticket[]> {
    const { data } = await api.get<Ticket[]>(
      `/bets/tickets/winners/${roundId}`,
    );
    return data;
  },

  async payTicket(ticketId: string): Promise<Ticket> {
    const { data } = await api.patch<Ticket>(`/bets/tickets/${ticketId}/pay`);
    return data;
  },
};

export default betsService;
