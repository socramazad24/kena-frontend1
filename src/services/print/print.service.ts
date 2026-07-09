import { PrintJobStatus } from '../../types/print.types';
import type {
  PrintData,
  PrintJob,
  PrintOptions,
  PrintResult,
  TicketType,
} from '../../types/print.types';
import { PrintAdapterFactory, type AdapterType } from './print-adapter.factory';
import type { IPrintAdapter } from './print-adapter.interface';

class PrintService {
  private jobs: Map<string, PrintJob> = new Map();
  private history: PrintJob[] = [];
  private maxHistory = 100;

  async print(data: PrintData, options?: PrintOptions): Promise<PrintJob> {
    const job: PrintJob = {
      id: this.generateId(),
      type: data.type,
      status: PrintJobStatus.PENDING,
      data,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);

    try {
      job.status = PrintJobStatus.RENDERING;

      const adapterType = options?.adapterType || 'pdf';
      const adapter = PrintAdapterFactory.create(adapterType);

      if (!(await adapter.isAvailable())) {
        const pdfAdapter = PrintAdapterFactory.create('pdf');
        const result = await pdfAdapter.process(job, options);
        job.result = result;
        job.status = PrintJobStatus.READY;
      } else {
        const result = await adapter.process(job, options);
        job.result = result;
        job.status = PrintJobStatus.READY;
      }

      if (options?.autoDownload && job.result?.pdfUrl) {
        this.downloadPdf(job);
      }

      if (options?.openInNewWindow && job.result?.pdfUrl) {
        window.open(job.result.pdfUrl, '_blank');
      }

      if (options?.preview && job.result?.htmlContent) {
        this.openPreview(job.result.htmlContent);
      }

      job.printedAt = new Date();
      job.status = PrintJobStatus.PRINTED;
      this.addToHistory(job);

      return job;
    } catch (err: any) {
      job.status = PrintJobStatus.FAILED;
      job.error = err.message;
      this.addToHistory(job);
      throw err;
    }
  }

  async reprint(jobId: string, options?: PrintOptions): Promise<PrintJob> {
    const original = this.history.find((j) => j.id === jobId);
    if (!original) {
      throw new Error(`Trabajo de impresión ${jobId} no encontrado`);
    }
    return this.print(original.data, options);
  }

  async preview(data: PrintData, adapterType: AdapterType = 'pdf'): Promise<string> {
    const adapter = PrintAdapterFactory.create(adapterType);
    return adapter.generateHtml(data);
  }

  private openPreview(html: string): void {
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  downloadPdf(job: PrintJob): void {
    if (!job.result?.pdfBlob) return;
    const url = URL.createObjectURL(job.result.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.type}-${job.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getHistory(limit = 50): PrintJob[] {
    return this.history.slice(0, limit);
  }

  getJob(jobId: string): PrintJob | undefined {
    return this.jobs.get(jobId) || this.history.find((j) => j.id === jobId);
  }

  async cancel(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status === PrintJobStatus.PENDING) {
      job.status = PrintJobStatus.CANCELLED;
      return true;
    }
    return false;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory(job: PrintJob): void {
    this.history.unshift(job);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }
}

export const printService = new PrintService();
