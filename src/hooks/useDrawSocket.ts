import { useEffect, useState } from 'react';
import { getSocket } from '../socket/socket';

interface DrawState {
  phase: 'idle' | 'closed' | 'drawing' | 'finished';
  roundId: string | null;
  roundNumber: number | null;
  revealedNumbers: string[];
  winningNumbers: string[];
  totalSales: number;
  totalPrizes: number;
  jackpotFinal: number;
}

const initialState: DrawState = {
  phase: 'idle',
  roundId: null,
  roundNumber: null,
  revealedNumbers: [],
  winningNumbers: [],
  totalSales: 0,
  totalPrizes: 0,
  jackpotFinal: 0,
};

export function useDrawSocket() {
  const [drawState, setDrawState] = useState<DrawState>(initialState);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onRoundClosed(data: any) {
      setDrawState({
        phase: 'closed',
        roundId: data.id,
        roundNumber: data.number,
        revealedNumbers: [],
        winningNumbers: [],
        totalSales: Number(data.totalSales) || 0,
        totalPrizes: 0,
        jackpotFinal: 0,
      });
    }

    function onRoundDrawing(data: any) {
      setDrawState((prev) => ({
        ...prev,
        phase: 'drawing',
        roundId: data.id,
        roundNumber: data.number,
      }));
    }

    function onNumberRevealed(data: {
      roundId: string;
      number: string;
      position: number;
      total: number;
    }) {
      setDrawState((prev) => ({
        ...prev,
        revealedNumbers: [...prev.revealedNumbers, data.number],
      }));
    }

    function onRoundFinished(data: {
      id: string;
      number: number;
      winningNumbers: string[];
      totalSales: number;
      totalPrizes: number;
      jackpot: number;
    }) {
      setDrawState({
        phase: 'finished',
        roundId: data.id,
        roundNumber: data.number,
        revealedNumbers: data.winningNumbers,
        winningNumbers: data.winningNumbers,
        totalSales: data.totalSales,
        totalPrizes: data.totalPrizes,
        jackpotFinal: data.jackpot,
      });
    }

    function onRoundNew(data: any) {
      setDrawState({
        ...initialState,
        phase: 'idle',
      });
    }

    socket.on('round:closed', onRoundClosed);
    socket.on('round:drawing', onRoundDrawing);
    socket.on('round:number-revealed', onNumberRevealed);
    socket.on('round:finished', onRoundFinished);
    socket.on('round:new', onRoundNew);

    return () => {
      socket.off('round:closed', onRoundClosed);
      socket.off('round:drawing', onRoundDrawing);
      socket.off('round:number-revealed', onNumberRevealed);
      socket.off('round:finished', onRoundFinished);
      socket.off('round:new', onRoundNew);
    };
  }, []);

  return drawState;
}
