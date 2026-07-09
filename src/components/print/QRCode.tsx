import { useQR } from '../../hooks/useQR';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRCode({ data, size = 120, className = '' }: QRCodeProps) {
  const svg = useQR(data, size);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{ display: 'inline-block' }}
    />
  );
}
