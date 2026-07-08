import type { Ticket, Setting } from '../../../types';
import Button from '../../ui/Button';
import Barcode from '../../ui/Barcode';

interface TicketModalProps {
  ticket: Ticket | null;
  settings: Setting | null;
  roundNumber: number | null;
  cashierName: string;
  onClose: () => void;
}

export default function TicketModal({
  ticket,
  settings,
  roundNumber,
  cashierName,
  onClose,
}: TicketModalProps) {
  if (!ticket) return null;

  // Alias local para que TypeScript no se queje
  const t = ticket;

  function handlePrint() {
    const w = window.open('', '_blank', 'width=400,height=700');
    if (!w) return;

    const barcodeSvg = document.getElementById('ticket-barcode-svg');
    const barcodeHtml = barcodeSvg ? barcodeSvg.outerHTML : '';

    w.document.write(`
      <html>
        <head>
          <title>Ticket ${t.code}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 10px; 
              width: 70mm;
              font-size: 12px;
            }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; }
            h1 { font-size: 20px; margin: 5px 0; font-weight: 900; }
            .nums { font-size: 16px; font-weight: 900; text-align: center; padding: 8px 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>${settings?.systemName || 'NUMERIX'}</h1>
            ${settings?.receiptHeader ? `<p style="font-size: 10px;">${settings.receiptHeader}</p>` : ''}
          </div>
          <div class="line"></div>
          <div class="row"><span>Ticket:</span><span><b>${t.code}</b></span></div>
          <div class="row"><span>Fecha:</span><span>${new Date(t.createdAt).toLocaleString()}</span></div>
          <div class="row"><span>Ronda:</span><span><b>#${roundNumber || '-'}</b></span></div>
          <div class="row"><span>Cajero:</span><span>${cashierName}</span></div>
          <div class="line"></div>
          <div class="center" style="font-weight: bold;">NÚMEROS:</div>
          <div class="nums">${t.numbers.map((n) => n.number).join(' - ')}</div>
          <div class="line"></div>
          <div class="row"><span>Cantidad:</span><span>${t.numbersCount}</span></div>
          <div class="row"><span>Valor c/u:</span><span>$${Number(t.unitValue).toFixed(2)}</span></div>
          <div class="row" style="font-size: 16px; font-weight: 900;"><span>TOTAL:</span><span>$${Number(t.totalAmount).toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="center">${barcodeHtml}</div>
          <div class="line"></div>
          ${settings?.receiptFooter ? `<p class="center" style="font-size: 10px;">${settings.receiptFooter}</p>` : ''}
          <p class="center" style="font-size: 9px; margin-top: 10px;">Conserve su ticket para reclamar premios</p>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header morado */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-center">
          <div className="text-3xl font-display font-extrabold text-white tracking-tight">
            NUMERIX
          </div>
          <p className="text-primary-200 text-sm">Tu juego, tu suerte</p>
        </div>

        {/* Cuerpo del ticket */}
        <div className="p-6 space-y-4">
          {/* Código */}
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Ticket
            </p>
            <p className="text-2xl font-display font-extrabold text-primary-600">
              {t.code}
            </p>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-gray-800 font-medium">
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <p className="text-xs text-gray-500">Ronda</p>
              <p className="text-gray-800 font-medium">#{roundNumber || '-'}</p>
            </div>
          </div>

          {/* Números */}
          <div>
            <p className="text-xs text-gray-500 mb-2 text-center uppercase tracking-wider">
              Números
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {t.numbers.map((n) => (
                <span
                  key={n.id}
                  className="px-3 py-1.5 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-lg font-mono font-bold text-sm"
                >
                  {n.number}
                </span>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-xl text-center">
            <p className="text-xs text-primary-200 uppercase tracking-wider">
              Total pagado
            </p>
            <p className="text-3xl font-display font-extrabold">
              ${Number(t.totalAmount).toFixed(2)}
            </p>
          </div>

          {/* Barcode */}
          <div className="text-center pt-2">
            <div id="ticket-barcode-svg">
              <Barcode value={t.code} height={50} width={1.5} />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <Button onClick={handlePrint} className="flex-1">
            🖨️ Imprimir
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Listo
          </Button>
        </div>
      </div>
    </div>
  );
}
