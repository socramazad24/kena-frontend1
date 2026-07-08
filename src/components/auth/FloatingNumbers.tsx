import { useEffect, useState } from 'react';

interface FloatingNumber {
  id: number;
  value: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  top: number;
}

export default function FloatingNumbers() {
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);

  useEffect(() => {
    const newNumbers: FloatingNumber[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      value: i.toString().padStart(2, '0'),
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      size: 40 + Math.random() * 60,
      top: Math.random() * 100,
    }));
    setNumbers(newNumbers);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    >
      {/* Números flotantes */}
      {numbers.map((n) => (
        <div
          key={n.id}
          className="absolute text-white/10 font-bold font-display animate-float"
          style={{
            left: `${n.left}%`,
            top: `${n.top}%`,
            fontSize: `${n.size}px`,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.duration}s`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {n.value}
        </div>
      ))}

      {/* Círculos decorativos */}
      <div
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 opacity-30 animate-float-slow"
        style={{ pointerEvents: 'none' }}
      ></div>
      <div
        className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 opacity-20 animate-float"
        style={{ pointerEvents: 'none' }}
      ></div>
      <div
        className="absolute bottom-32 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-primary-600 opacity-20 animate-float-slow"
        style={{ pointerEvents: 'none' }}
      ></div>
      <div
        className="absolute bottom-20 right-1/4 w-14 h-14 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 opacity-30 animate-float"
        style={{ pointerEvents: 'none' }}
      ></div>
    </div>
  );
}
