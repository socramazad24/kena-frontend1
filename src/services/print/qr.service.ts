/**
 * Servicio para generar códigos QR.
 * 
 * NOTA: Este servicio está preparado pero NO implementado completamente.
 * Para activarlo, instala una librería como:
 * - qrcode
 * - qrcode-generator
 * 
 * Y luego implementa generateQR() y generateQRDataURL().
 */

export interface QRService {
  generateQR(data: string, size?: number): string;
  generateQRDataURL(data: string): Promise<string>;
}

class QRServiceImpl implements QRService {
  generateQR(data: string, size: number = 200): string {
    // TODO: Implementar cuando se instale la librería
    // Por ahora, retorna un placeholder SVG
    return this.generatePlaceholder(data, size);
  }

  async generateQRDataURL(data: string): Promise<string> {
    // TODO: Implementar cuando se instale la librería
    return this.generateQR(data);
  }

  private generatePlaceholder(data: string, size: number): string {
    // Genera un placeholder visual para que se vea en el preview
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white" stroke="black"/>
        <text x="50%" y="45%" text-anchor="middle" font-size="14" font-family="monospace">
          QR CODE
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-size="10" font-family="monospace" fill="#666">
          ${data.substring(0, 20)}...
        </text>
        <text x="50%" y="75%" text-anchor="middle" font-size="8" font-family="monospace" fill="#999">
          (Instalar librería QR)
        </text>
      </svg>
    `;
  }
}

export const qrService = new QRServiceImpl();
