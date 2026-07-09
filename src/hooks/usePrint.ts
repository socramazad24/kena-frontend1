import { useState, useCallback } from 'react';
import { printService } from '../services/print/print.service';
import type {
    PrintData,
    PrintJob,
    PrintOptions,
    TicketType,
} from '../types/print.types';
import type { AdapterType } from '../services/print/print-adapter.factory';

interface UsePrintReturn {
  print: (data: PrintData, options?: PrintOptions) => Promise<PrintJob | null>;
  preview: (data: PrintData) => Promise<string>;
  loading: boolean;
  error: string | null;
  lastJob: PrintJob | null;
  reprint: (jobId: string) => Promise<PrintJob | null>;
  history: PrintJob[];
}

export function usePrint(): UsePrintReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastJob, setLastJob] = useState<PrintJob | null>(null);
  const [history, setHistory] = useState<PrintJob[]>([]);

  const print = useCallback(
    async (data: PrintData, options?: PrintOptions): Promise<PrintJob | null> => {
      setLoading(true);
      setError(null);
      try {
        const job = await printService.print(data, options);
        setLastJob(job);
        setHistory(printService.getHistory());
        return job;
      } catch (err: any) {
        setError(err.message || 'Error al imprimir');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const preview = useCallback(async (data: PrintData): Promise<string> => {
    return printService.preview(data);
  }, []);

  const reprint = useCallback(
    async (jobId: string): Promise<PrintJob | null> => {
      setLoading(true);
      setError(null);
      try {
        const job = await printService.reprint(jobId);
        setLastJob(job);
        return job;
      } catch (err: any) {
        setError(err.message || 'Error al reimprimir');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { print, preview, loading, error, lastJob, reprint, history };
}
