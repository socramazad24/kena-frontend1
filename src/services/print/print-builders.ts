import { type PrintData, TicketType } from '../../types/print.types';
import type { Ticket, CashSession, Cashier, Branch, Setting } from '../../types';

interface BuildBetPrintDataParams {
  ticket: Ticket;
  branch: Branch;
  cashier: Cashier;
  setting: Setting;
  roundNumber: number;
  jackpot: number;
  customMessage?: string;
}

export function buildBetPrintData(
  params: BuildBetPrintDataParams,
): PrintData {
  const {
    ticket,
    branch,
    cashier,
    setting,
    roundNumber,
    jackpot,
    customMessage,
  } = params;

  return {
    type: TicketType.BET,
    businessName: setting.systemName || 'NUMERIX',
    branchName: branch.name,
    branchCode: branch.code,
    cashierName: cashier.user.fullName,
    generatedAt: new Date(),
    payload: {
      ticketCode: ticket.code,
      roundNumber,
      numbers: ticket.numbers.map((n) => n.number),
      unitValue: Number(ticket.unitValue),
      totalAmount: Number(ticket.totalAmount),
      jackpot,
      status: ticket.status,
      customMessage,
      qrData: JSON.stringify({
        code: ticket.code,
        round: roundNumber,
        amount: ticket.totalAmount,
        verify: `${import.meta.env.VITE_API_URL}/api/bets/tickets/code/${ticket.code}`,
      }),
    },
  };
}

interface BuildPrizePrintDataParams {
  ticket: Ticket;
  branch: Branch;
  cashier: Cashier;
  setting: Setting;
  roundNumber: number;
}

export function buildPrizePrintData(
  params: BuildPrizePrintDataParams,
): PrintData {
  const { ticket, branch, cashier, setting, roundNumber } = params;

  return {
    type: TicketType.PRIZE,
    businessName: setting.systemName || 'NUMERIX',
    branchName: branch.name,
    branchCode: branch.code,
    cashierName: cashier.user.fullName,
    generatedAt: new Date(),
    payload: {
      ticketCode: ticket.code,
      prizeAmount: Number(ticket.prizeAmount),
      roundNumber,
      hits: ticket.hits,
      totalNumbers: ticket.numbersCount,
      isPaid: ticket.status === 'paid',
      qrData: JSON.stringify({
        code: ticket.code,
        type: 'prize',
        amount: ticket.prizeAmount,
        verify: `${import.meta.env.VITE_API_URL}/api/bets/tickets/code/${ticket.code}`,
      }),
    },
  };
}

interface BuildCashClosurePrintDataParams {
  session: CashSession;
  branch: Branch;
  cashier: Cashier;
  setting: Setting;
  totalTicketsSold: number;
  totalPrizesPaid: number;
  totalCancellations: number;
  totalCancellationsAmount: number;
  countedBalance: number;
  notes?: string;
}

export function buildCashClosurePrintData(
  params: BuildCashClosurePrintDataParams,
): PrintData {
  const {
    session,
    branch,
    cashier,
    setting,
    totalTicketsSold,
    totalPrizesPaid,
    totalCancellations,
    totalCancellationsAmount,
    countedBalance,
    notes,
  } = params;

  const initialAmount = Number(session.initialAmount);
  const totalReceived = Number(session.totalSales);
  const totalPrizes = Number(session.totalPrizes);
  const expectedBalance =
    initialAmount + totalReceived - totalPrizes - totalCancellationsAmount;
  const difference = countedBalance - expectedBalance;

  return {
    type: TicketType.CASH_CLOSURE,
    businessName: setting.systemName || 'NUMERIX',
    branchName: branch.name,
    branchCode: branch.code,
    cashierName: cashier.user.fullName,
    generatedAt: new Date(),
    payload: {
      sessionId: session.id,
      openedAt: new Date(session.openedAt),
      closedAt: new Date(session.closedAt || new Date()),
      initialAmount,
      totalReceived,
      totalPrizes,
      totalCancellations: totalCancellationsAmount,
      expectedBalance,
      countedBalance,
      difference,
      totalTicketsSold,
      totalPrizesPaid,
      totalCancellationsCount: totalCancellations,
      notes,
      qrData: JSON.stringify({
        session: session.id,
        cashier: cashier.user.username,
        closed: session.closedAt,
      }),
    },
  };
}

interface BuildDailyReportPrintDataParams {
  date: string;
  totalSales: number;
  totalPrizes: number;
  profit: number;
  profitMargin: number;
  totalTickets: number;
  totalPrizesPaid: number;
  byBranch: Array<{
    code: string;
    name: string;
    sales: number;
    prizes: number;
    profit: number;
  }>;
  topCashiers: Array<{ name: string; sales: number; tickets: number }>;
  branch: Branch;
  setting: Setting;
  cashierName?: string;
}

export function buildDailyReportPrintData(
  params: BuildDailyReportPrintDataParams,
): PrintData {
  return {
    type: TicketType.DAILY_REPORT,
    businessName: params.setting.systemName || 'NUMERIX',
    branchName: params.branch.name,
    branchCode: params.branch.code,
    cashierName: params.cashierName || 'Sistema',
    generatedAt: new Date(),
    payload: {
      date: params.date,
      totalSales: params.totalSales,
      totalPrizes: params.totalPrizes,
      profit: params.profit,
      profitMargin: params.profitMargin,
      totalTickets: params.totalTickets,
      totalPrizesPaid: params.totalPrizesPaid,
      byBranch: params.byBranch,
      topCashiers: params.topCashiers,
      qrData: JSON.stringify({
        type: 'daily_report',
        date: params.date,
        sales: params.totalSales,
      }),
    },
  };
}
