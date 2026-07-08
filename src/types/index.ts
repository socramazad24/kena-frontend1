export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'cashier';
  isActive?: boolean;
}

export interface Cashier {
  id: string;
  userId: string;
  user: UserInfo;
  branchId: string;
  branch: Branch;
  initialBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  receiptHeader?: string;
  receiptFooter?: string;
  updatedAt: string;
}

// Tipos para Rondas
export type RoundStatus = 'open' | 'closed' | 'drawing' | 'finished';

export interface Round {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  status: RoundStatus;
  winningNumbers: string[] | null;
  totalSales: string;
  totalPrizes: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para Apuestas
export type TicketStatus = 'active' | 'won' | 'lost' | 'paid' | 'cancelled';

export interface Bet {
  id: string;
  ticketId: string;
  number: string;
  amount: number;
}

export interface Ticket {
  round: any;
  id: string;
  code: string;
  soldById: string;
  cashierId: string;
  branchId: string;
  roundId: string;
  unitValue: number;
  numbersCount: number;
  totalAmount: number;
  prizeAmount: number;
  status: TicketStatus;
  hits: number;
  numbers: Bet[];
  createdAt: string;
}

// Tipos para Caja
export type CashSessionStatus = 'open' | 'closed';
export type MovementType = 'sale' | 'prize' | 'adjustment' | 'deposit' | 'withdrawal';

export interface CashSession {
  id: string;
  cashierId: string;
  openedById: string;
  closedById: string | null;
  initialAmount: number;
  totalSales: number;
  totalPrizes: number;
  finalAmount: number | null;
  status: CashSessionStatus;
  openedAt: string;
  closedAt: string | null;
  notes: string | null;
}

export interface CashBalance {
  initial: number;
  sales: number;
  prizes: number;
  current: number;
}

// Tipos para número vendido
export interface SoldNumber {
  number: string;
  count: number;
  totalAmount: number;
}

// DTOs
export interface CreateTicketItem {
  number: string;
  amount: number;
}

export interface CreateTicketPayload {
  cashierId: string;
  branchId: string;
  items: CreateTicketItem[];
}

export interface OpenCashPayload {
  cashierId: string;
  initialAmount: number;
  notes?: string;
}

export interface CloseCashPayload {
  finalAmount: number;
  notes?: string;
}

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

// Tipos para Reportes
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


