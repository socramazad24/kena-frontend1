import { jsPDF } from 'jspdf';
import type { IPrintAdapter } from './print-adapter.interface';
import {
  type PrintData,
  type PrintJob,
  type PrintOptions,
  type PrintResult,
  TicketType,
} from '../../types/print.types';

export class PdfPrintAdapter implements IPrintAdapter {
  readonly type = 'pdf' as const;
  readonly name = 'PDF Generator';

  private readonly THERMAL_WIDTH = 80;
  private readonly A4_WIDTH = 210;
  private readonly A4_HEIGHT = 297;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async process(job: PrintJob, options?: PrintOptions): Promise<PrintResult> {
    const { type, payload } = job.data;

    const pageWidth = options?.pageWidth || this.getDefaultWidth(type);
    const copies = options?.copies || 1;

    const html = this.generateHtml(job.data);

    if (this.isThermal(type)) {
      return this.generateThermalPdf(html, type, job, options);
    }

    return this.generateA4Pdf(html, job, options);
  }

  generateHtml(data: PrintData): string {
    const { type, payload } = data;

    switch (type) {
      case TicketType.BET:
        return this.generateBetHtml(data, payload as any);
      case TicketType.PRIZE:
        return this.generatePrizeHtml(data, payload as any);
      case TicketType.CASH_CLOSURE:
        return this.generateCashClosureHtml(data, payload as any);
      case TicketType.DAILY_REPORT:
        return this.generateDailyReportHtml(data, payload as any);
      default:
        return '<p>Tipo de ticket no soportado</p>';
    }
  }

  async cancel(jobId: string): Promise<boolean> {
    return true;
  }

  // ============================================
  // GENERADORES DE HTML
  // ============================================

  private generateBetHtml(data: PrintData, payload: any): string {
    const { businessName, branchName, cashierName, generatedAt } = data;
    const {
      ticketCode,
      roundNumber,
      numbers,
      unitValue,
      totalAmount,
      jackpot,
      status,
      customMessage,
      qrData,
    } = payload;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket ${ticketCode}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 5mm;
      font-size: 12px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 5px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .qr { text-align: center; margin: 8px 0; }
    .numbers {
      font-size: 16px;
      text-align: center;
      padding: 8px 0;
      font-weight: bold;
      letter-spacing: 3px;
    }
    .logo { font-size: 24px; font-weight: 900; margin-bottom: 5px; }
    .total {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      padding: 8px;
      background: #000;
      color: #fff;
      margin: 8px 0;
    }
    .status {
      text-align: center;
      font-weight: bold;
      padding: 4px;
      border: 1px solid #000;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="center logo">${businessName}</div>
  <div class="center">${branchName}</div>
  <div class="line"></div>

  <div class="row"><span>Fecha:</span><span>${this.formatDate(generatedAt)}</span></div>
  <div class="row"><span>Hora:</span><span>${this.formatTime(generatedAt)}</span></div>
  <div class="row"><span>Cajero:</span><span>${cashierName}</span></div>
  <div class="row"><span>Ronda:</span><span>#${roundNumber}</span></div>
  <div class="line"></div>

  <div class="center bold">TICKET</div>
  <div class="center bold" style="font-size:14px;">${ticketCode}</div>

  <div class="line"></div>
  <div class="center bold">NÚMEROS JUGADOS</div>
  <div class="numbers">${numbers.join(' - ')}</div>
  <div class="line"></div>

  <div class="row"><span>Cantidad:</span><span>${numbers.length} números</span></div>
  <div class="row"><span>Valor c/u:</span><span>$${unitValue.toFixed(2)}</span></div>

  <div class="total">TOTAL: $${totalAmount.toFixed(2)}</div>

  <div class="line"></div>
  <div class="row"><span>Jackpot:</span><span>$${jackpot.toFixed(2)}</span></div>
  <div class="status">ESTADO: ${this.translateStatus(status)}</div>

  <div class="qr">
    <div id="qr-placeholder">[QR: ${qrData.substring(0, 30)}...]</div>
  </div>

  ${customMessage ? `<div class="center" style="margin-top:8px; font-size:10px;">${customMessage}</div>` : ''}

  <div class="line"></div>
  <div class="center" style="font-size:10px;">
    Conserve su ticket para reclamar premios<br>
    ¡Gracias por su compra!
  </div>
</body>
</html>`;
  }

  private generatePrizeHtml(data: PrintData, payload: any): string {
    const { businessName, branchName, cashierName, generatedAt } = data;
    const {
      ticketCode,
      prizeAmount,
      roundNumber,
      hits,
      totalNumbers,
      isPaid,
      qrData,
    } = payload;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Premio ${ticketCode}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 5mm;
      font-size: 12px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 5px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .logo { font-size: 24px; font-weight: 900; margin-bottom: 5px; }
    .prize {
      font-size: 24px;
      font-weight: 900;
      text-align: center;
      padding: 15px;
      background: #000;
      color: #fff;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="center logo">${businessName}</div>
  <div class="center">${branchName}</div>
  <div class="line"></div>

  <div class="center bold" style="font-size:14px;">COMPROBANTE DE PREMIO</div>

  <div class="line"></div>
  <div class="row"><span>Ticket:</span><span>${ticketCode}</span></div>
  <div class="row"><span>Fecha:</span><span>${this.formatDate(generatedAt)}</span></div>
  <div class="row"><span>Hora:</span><span>${this.formatTime(generatedAt)}</span></div>
  <div class="row"><span>Ronda:</span><span>#${roundNumber}</span></div>
  <div class="row"><span>Aciertos:</span><span>${hits} de ${totalNumbers}</span></div>
  <div class="row"><span>Cajero:</span><span>${cashierName}</span></div>

  <div class="line"></div>
  <div class="prize">$${prizeAmount.toFixed(2)}</div>

  <div class="center bold" style="margin-top:10px;">
    ${isPaid ? '✓ PAGADO' : 'PENDIENTE DE PAGO'}
  </div>

  <div class="line"></div>
  <div class="center" style="font-size:10px;">
    [QR: ${qrData.substring(0, 30)}...]
  </div>
</body>
</html>`;
  }

  private generateCashClosureHtml(data: PrintData, payload: any): string {
    const { businessName, branchName, cashierName, generatedAt } = data;
    const {
      sessionId,
      openedAt,
      closedAt,
      initialAmount,
      totalReceived,
      totalPrizes,
      totalCancellations,
      expectedBalance,
      countedBalance,
      difference,
      totalTicketsSold,
      totalPrizesPaid,
      totalCancellationsCount,
      notes,
    } = payload;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cierre de Caja ${sessionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 5mm;
      font-size: 11px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 5px 0; }
    .row { display: flex; justify-content: space-between; margin: 1px 0; }
    .section { margin: 5px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px;">CIERRE DE CAJA</div>
  <div class="center">${businessName}</div>
  <div class="center">${branchName}</div>
  <div class="line"></div>

  <div class="row"><span>Sesión:</span><span>${sessionId.substring(0, 8)}...</span></div>
  <div class="row"><span>Cajero:</span><span>${cashierName}</span></div>
  <div class="row"><span>Apertura:</span><span>${this.formatDateTime(openedAt)}</span></div>
  <div class="row"><span>Cierre:</span><span>${this.formatDateTime(closedAt)}</span></div>

  <div class="line"></div>
  <div class="section">RESUMEN</div>

  <div class="row"><span>Saldo inicial:</span><span>$${initialAmount.toFixed(2)}</span></div>
  <div class="row"><span>(+) Recibido:</span><span>$${totalReceived.toFixed(2)}</span></div>
  <div class="row"><span>(-) Premios:</span><span>$${totalPrizes.toFixed(2)}</span></div>
  <div class="row"><span>(-) Cancelaciones:</span><span>$${totalCancellations.toFixed(2)}</span></div>
  <div class="line"></div>

  <div class="row bold"><span>Esperado:</span><span>$${expectedBalance.toFixed(2)}</span></div>
  <div class="row bold"><span>Contado:</span><span>$${countedBalance.toFixed(2)}</span></div>
  <div class="row bold" style="font-size:13px;">
    <span>Diferencia:</span>
    <span>$${difference.toFixed(2)}</span>
  </div>

  <div class="line"></div>
  <div class="section">CONTADORES</div>

  <div class="row"><span>Tickets vendidos:</span><span>${totalTicketsSold}</span></div>
  <div class="row"><span>Premios pagados:</span><span>${totalPrizesPaid}</span></div>
  <div class="row"><span>Cancelaciones:</span><span>${totalCancellationsCount}</span></div>

  ${notes ? `<div class="line"></div><div class="bold">Notas:</div><div style="font-size:10px;">${notes}</div>` : ''}

  <div class="line"></div>
  <div class="center" style="margin-top:20px;">_______________________</div>
  <div class="center" style="font-size:10px;">Firma del Cajero</div>
  <div style="margin-top:20px;"></div>
  <div class="center">_______________________</div>
  <div class="center" style="font-size:10px;">Firma del Administrador</div>

  <div class="line"></div>
  <div class="center" style="font-size:9px;">
    Impreso: ${this.formatDateTime(generatedAt)}
  </div>
</body>
</html>`;
  }

  private generateDailyReportHtml(data: PrintData, payload: any): string {
    const { businessName, branchName, generatedAt } = data;
    const {
      date,
      totalSales,
      totalPrizes,
      profit,
      profitMargin,
      totalTickets,
      totalPrizesPaid,
      byBranch,
      topCashiers,
    } = payload;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Diario ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 5mm;
      font-size: 11px;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 5px 0; }
    .row { display: flex; justify-content: space-between; margin: 1px 0; }
    .section { margin: 5px 0; font-weight: bold; text-transform: uppercase; font-size: 10px; }
    .item { font-size: 10px; margin: 2px 0; }
  </style>
</head>
<body>
  <div class="center bold" style="font-size:14px;">REPORTE DIARIO</div>
  <div class="center">${businessName}</div>
  <div class="center">${branchName}</div>
  <div class="line"></div>

  <div class="center bold">${date}</div>
  <div class="row"><span>Generado:</span><span>${this.formatTime(generatedAt)}</span></div>

  <div class="line"></div>
  <div class="section">Resumen General</div>

  <div class="row"><span>Total Ventas:</span><span>$${totalSales.toFixed(2)}</span></div>
  <div class="row"><span>Total Premios:</span><span>$${totalPrizes.toFixed(2)}</span></div>
  <div class="row bold"><span>Ganancia:</span><span>$${profit.toFixed(2)}</span></div>
  <div class="row"><span>Margen:</span><span>${profitMargin.toFixed(1)}%</span></div>
  <div class="row"><span>Tickets:</span><span>${totalTickets}</span></div>
  <div class="row"><span>Premios pagados:</span><span>${totalPrizesPaid}</span></div>

  <div class="line"></div>
  <div class="section">Por Sucursal</div>
  ${byBranch
    .map(
      (b: any) => `
    <div class="item">
      <div>${b.code} - ${b.name}</div>
      <div class="row">
        <span>Ventas: $${b.sales.toFixed(2)}</span>
        <span>Gan: $${b.profit.toFixed(2)}</span>
      </div>
    </div>
  `,
    )
    .join('')}

  <div class="line"></div>
  <div class="section">Top Cajeros</div>
  ${topCashiers
    .map(
      (c: any, i: number) => `
    <div class="item">
      <div>${i + 1}. ${c.name}</div>
      <div class="row">
        <span>$${c.sales.toFixed(2)}</span>
        <span>${c.tickets} tickets</span>
      </div>
    </div>
  `,
    )
    .join('')}

  <div class="line"></div>
  <div class="center" style="font-size:9px;">
    Solo información administrativa
  </div>
</body>
</html>`;
  }

  // ============================================
  // GENERACIÓN DE PDF
  // ============================================

  private async generateThermalPdf(
    html: string,
    type: TicketType,
    job: PrintJob,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const widthMM = options?.pageWidth || 80;
    const heightMM = this.estimateHeight(type);

    const pdf = new jsPDF({
      unit: 'mm',
      format: [widthMM, heightMM],
      orientation: 'portrait',
    });

    await this.renderHtmlToPdf(pdf, html, widthMM, heightMM);

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    return {
      pdfBlob: blob,
      pdfUrl: url,
      htmlContent: html,
      pages: 1,
      sizeBytes: blob.size,
    };
  }

  private async generateA4Pdf(
    html: string,
    job: PrintJob,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    await this.renderHtmlToPdf(pdf, html, 210, 297);

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    return {
      pdfBlob: blob,
      pdfUrl: url,
      htmlContent: html,
      pages: pdf.getNumberOfPages(),
      sizeBytes: blob.size,
    };
  }

  private async renderHtmlToPdf(
    pdf: jsPDF,
    html: string,
    widthMM: number,
    heightMM: number,
  ): Promise<void> {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${widthMM}mm`;
    document.body.appendChild(container);

    try {
      this.drawHtmlAsText(pdf, container, widthMM, heightMM);
    } finally {
      document.body.removeChild(container);
    }
  }

  private drawHtmlAsText(
    pdf: jsPDF,
    container: HTMLElement,
    widthMM: number,
    heightMM: number,
  ): void {
    const elements = container.querySelectorAll('*');
    let y = 5;
    const margin = 3;
    const lineHeight = 4;

    pdf.setFontSize(10);

    elements.forEach((el) => {
      if (y > heightMM - 5) return;

      const text = el.textContent?.trim();
      if (!text) return;

      const tagName = el.tagName.toLowerCase();

      if (tagName === 'div' || tagName === 'p' || tagName === 'span') {
        const computedStyle = window.getComputedStyle(el);
        const isBold =
          computedStyle.fontWeight === 'bold' ||
          parseInt(computedStyle.fontWeight) >= 600;
        const textAlign = computedStyle.textAlign;

        pdf.setFont('courier', isBold ? 'bold' : 'normal');

        if (textAlign === 'center') {
          pdf.text(text, widthMM / 2, y, { align: 'center' });
        } else {
          pdf.text(text, margin, y);
        }
        y += lineHeight;
      } else if (tagName === 'hr') {
        pdf.line(margin, y, widthMM - margin, y);
        y += 2;
      }
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private isThermal(type: TicketType): boolean {
    return type === TicketType.BET || type === TicketType.PRIZE;
  }

  private getDefaultWidth(type: TicketType): number {
    if (this.isThermal(type)) {
      return this.THERMAL_WIDTH;
    }
    return this.A4_WIDTH;
  }

  private estimateHeight(type: TicketType): number {
    switch (type) {
      case TicketType.BET:
        return 120;
      case TicketType.PRIZE:
        return 90;
      case TicketType.CASH_CLOSURE:
        return 180;
      case TicketType.DAILY_REPORT:
        return 200;
      default:
        return 100;
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      active: 'ACTIVO',
      won: 'GANADOR',
      lost: 'PERDEDOR',
      paid: 'PAGADO',
      cancelled: 'CANCELADO',
    };
    return map[status] || status.toUpperCase();
  }
}
