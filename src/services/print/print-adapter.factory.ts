import type { IPrintAdapter } from './print-adapter.interface';
import { PdfPrintAdapter } from './pdf-print.adapter';
import { ThermalPrintAdapter } from './thermal-print.adapter';

export type AdapterType = 'pdf' | 'thermal';

export class PrintAdapterFactory {
  private static adapters: Map<AdapterType, IPrintAdapter> = new Map();

  static create(type: AdapterType): IPrintAdapter {
    if (!this.adapters.has(type)) {
      switch (type) {
        case 'pdf':
          this.adapters.set(type, new PdfPrintAdapter());
          break;
        case 'thermal':
          this.adapters.set(type, new ThermalPrintAdapter());
          break;
        default:
          throw new Error(`Tipo de adaptador desconocido: ${type}`);
      }
    }
    return this.adapters.get(type)!;
  }

  static async createAuto(): Promise<IPrintAdapter> {
    const thermal = this.create('thermal');
    if (await thermal.isAvailable()) {
      return thermal;
    }
    return this.create('pdf');
  }

  static getAvailableTypes(): AdapterType[] {
    return ['pdf', 'thermal'];
  }
}
