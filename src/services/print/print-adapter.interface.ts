import type { PrintData, PrintJob, PrintOptions, PrintResult } from '../../types/print.types';

export interface IPrintAdapter {
  readonly type: 'pdf' | 'thermal';
  readonly name: string;

  isAvailable(): Promise<boolean>;
  process(job: PrintJob, options?: PrintOptions): Promise<PrintResult>;
  generateHtml(data: PrintData): string;
  cancel(jobId: string): Promise<boolean>;
}
