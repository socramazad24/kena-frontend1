import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDrawSocket } from '../../hooks/useDrawSocket';
import type { Jackpot } from '../../types';

interface DrawModalProps {
  jackpot: Jackpot | null;
  totalNumbers?: number;
}

export default function DrawModal({ jackpot, totalNumbers }: DrawModalProps) {
  const draw = useDrawSocket();
  const winningCount = totalNumbers || jackpot?.winningNumbersCount || 3;
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  // Disparar confetti al finalizar
  useEffect(() => {
    if (draw.phase === 'finished' && !hasFiredConfetti) {
      fireConfetti();
      setHasFiredConfetti(true);
    }
    if (draw.phase === 'idle') {
      setHasFiredConfetti(false);
    }
  }, [draw.phase, hasFiredConfetti]);

  function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#8b5cf6', '#a78bfa', '#facc15', '#fbbf24', '#34d399'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Burst central
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    }, 200);
  }

  if (draw.phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-950/95 via-primary-900/95 to-purple-950/95 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900 rounded-3xl p-8 max-w-2xl w-full text-center shadow-2xl border border-primary-700/50">
        {/* Título */}
        <div className="mb-6">
          <p className="text-yellow-300 text-sm uppercase tracking-widest font-bold mb-1">
            🎰 Sorteo en Vivo
          </p>
          <h1 className="text-4xl font-display font-extrabold text-white">
            Ronda #{draw.roundNumber}
          </h1>
        </div>

        {/* FASE: Ventas cerradas */}
        {draw.phase === 'closed' && (
          <div className="py-12">
            <div className="text-7xl mb-4 animate-pulse">⏳</div>
            <p className="text-2xl text-white font-display font-bold mb-2">
              Ventas cerradas
            </p>
            <p className="text-primary-200">
              El sorteo está por comenzar...
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        )}

        {/* FASE: Sorteando */}
        {draw.phase === 'drawing' && (
          <div className="py-6">
            <p className="text-yellow-300 text-lg mb-6 font-display font-bold">
              🎯 Números ganadores
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              {Array.from({ length: winningCount }).map((_, idx) => {
                const number = draw.revealedNumbers[idx];
                return (
                  <div
                    key={idx}
                    className={`
                      w-24 h-24 rounded-2xl flex items-center justify-center
                      text-4xl font-display font-bold
                      transition-all duration-700 transform
                      ${
                        number
                          ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 text-white scale-100 shadow-2xl ring-4 ring-yellow-300/50 rotate-0'
                          : 'bg-primary-800/50 text-primary-400 scale-90 animate-pulse border-2 border-primary-600'
                      }
                    `}
                  >
                    {number || '?'}
                  </div>
                );
              })}
            </div>
            <p className="text-primary-200 text-sm">
              {draw.revealedNumbers.length} de {winningCount} números revelados
            </p>
          </div>
        )}

        {/* FASE: Finalizado */}
        {draw.phase === 'finished' && (
          <div className="py-6">
            <div className="text-6xl mb-3 animate-bounce">🏆</div>
            <p className="text-yellow-300 text-xl mb-4 font-display font-extrabold">
              ¡Sorteo Finalizado!
            </p>

            <div className="flex justify-center gap-3 flex-wrap mb-6">
              {draw.winningNumbers.map((number, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-display font-bold bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-2xl ring-4 ring-green-300/50 animate-bounce"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {number}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-primary-200 text-xs">Ventas</p>
                <p className="text-white font-display font-bold text-lg">
                  ${draw.totalSales.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-primary-200 text-xs">Premios</p>
                <p className="text-green-300 font-display font-bold text-lg">
                  ${draw.totalPrizes.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-primary-200 text-xs">Jackpot</p>
                <p className="text-yellow-300 font-display font-bold text-lg">
                  ${draw.jackpotFinal.toFixed(2)}
                </p>
              </div>
            </div>

            <p className="text-primary-300 text-sm mt-6">
              ⏳ Nueva ronda en unos segundos...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
