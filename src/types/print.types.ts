// Tipos de tickets que el sistema puede generar
// (Reemplazamos enum por union types para compatibilidad con erasableSyntaxOnly)
export type TicketType =
  | 'bet'
  | 'prize'
  | 'cash_closure'
  | 'daily_report';

// Estado del trabajo de impresión
export type PrintJobStatus =
  | 'pending'
  | 'rendering'
  | 'ready'
  | 'printed'
  | 'failed'
  | 'cancelled';

// Constantes para usar en el código
export const TicketType = {
  BET: 'bet' as TicketType,
  PRIZE: 'prize' as TicketType,
  CASH_CLOSURE: 'cash_closure' as TicketType,
  DAILY_REPORT: 'daily_report' as TicketType,
};

export const PrintJobStatus = {
  PENDING: 'pending' as PrintJobStatus,
  RENDERING: 'rendering' as PrintJobStatus,
  READY: 'ready' as PrintJobStatus,
  PRINTED: 'printed' as PrintJobStatus,
  FAILED: 'failed' as PrintJobStatus,
  CANCELLED: 'cancelled' as PrintJobStatus,
};

// Interfaz común para todos los datos de impresión
export interface PrintData {
  type: TicketType;
  businessName: string;
  branchName: string;
  branchCode: string;
  cashierName: string;
  generatedAt: Date;
  payload: BetPrintPayload | PrizePrintPayload | CashClosurePrintPayload | DailyReportPrintPayload;
}

// ============================================
// PAYLOADS ESPECÍFICOS POR TIPO
// ============================================

// Ticket de Apuesta
export interface BetPrintPayload {
  ticketCode: string;
  roundNumber: number;
  numbers: string[];
  unitValue: number;
  totalAmount: number;
  jackpot: number;
  status: 'active' | 'won' | 'lost' | 'paid' | 'cancelled';
  customMessage?: string;
  qrData: string;
}

// Ticket de Premio
export interface PrizePrintPayload {
  ticketCode: string;
  prizeAmount: number;
  roundNumber: number;
  hits: number;
  totalNumbers: number;
  isPaid: boolean;
  qrData: string;
}

// Cierre de Caja
export interface CashClosurePrintPayload {
  sessionId: string;
  openedAt: Date;
  closedAt: Date;
  initialAmount: number;
  totalReceived: number;
  totalPrizes: number;
  totalCancellations: number;
  expectedBalance: number;
  countedBalance: number;
  difference: number;
  totalTicketsSold: number;
  totalPrizesPaid: number;
  totalCancellationsCount: number;
  notes?: string;
  qrData: string;
}

// Reporte Diario
export interface DailyReportPrintPayload {
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
  topCashiers: Array<{
    name: string;
    sales: number;
    tickets: number;
  }>;
  qrData: string;
}

// ============================================
// TRABAJO DE IMPRESIÓN
// ============================================

export interface PrintJob {
  id: string;
  type: TicketType;
  status: PrintJobStatus;
  data: PrintData;
  createdAt: Date;
  printedAt?: Date;
  error?: string;
  result?: PrintResult;
}

export interface PrintResult {
  pdfBlob?: Blob;
  pdfUrl?: string;
  rawData?: Uint8Array;
  htmlContent?: string;
  pages: number;
  sizeBytes: number;
}

export interface PrintOptions {
  pageWidth?: number;
  copies?: number;
  preview?: boolean;
  autoDownload?: boolean;
  openInNewWindow?: boolean;
  adapterType?: 'pdf' | 'thermal';
}

export interface PrinterConfig {
  type: 'pdf' | 'thermal' | 'browser';
  name: string;
  width: number;
  characterSet?: string;
}
