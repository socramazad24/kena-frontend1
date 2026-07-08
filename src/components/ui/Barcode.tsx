import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  className?: string;
}

export default function Barcode({
  value,
  width = 1.5,
  height = 50,
  fontSize = 14,
  className = '',
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          fontSize,
          margin: 5,
          background: '#ffffff',
          lineColor: '#1f2937',
          displayValue: true,
        });
      } catch (error) {
        console.error('Error generando barcode:', error);
      }
    }
  }, [value, width, height, fontSize]);

  return <svg ref={svgRef} className={className} />;
}
