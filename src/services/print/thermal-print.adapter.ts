import type { IPrintAdapter } from './print-adapter.interface';
import type { PrintData, PrintJob, PrintOptions, PrintResult } from '../../types/print.types';

export class ThermalPrintAdapter implements IPrintAdapter {
  readonly type = 'thermal' as const;
  readonly name = 'Thermal Printer (Stub)';

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async process(job: PrintJob, options?: PrintOptions): Promise<PrintResult> {
    throw new Error(
      'ThermalPrintAdapter: La impresión en impresora térmica ' +
        'aún no está implementada. Use PdfPrintAdapter por ahora.',
    );
  }

  generateHtml(data: PrintData): string {
    return `<html><body><p>Thermal printer no implementada. Use PDF.</p></body></html>`;
  }

  async cancel(jobId: string): Promise<boolean> {
    return true;
  }
}
