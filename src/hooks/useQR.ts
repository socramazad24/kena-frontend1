import { useEffect, useState } from 'react';
import { qrService } from '../services/print/qr.service';

export function useQR(data: string, size: number = 120) {
  const [qrSvg, setQrSvg] = useState<string>('');

  useEffect(() => {
    if (data) {
      setQrSvg(qrService.generateQR(data, size));
    }
  }, [data, size]);

  return qrSvg;
}
