import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../socket/socket';

interface RoundTick {
  roundId: string;
  roundNumber: number;
  status: string;
  remainingSeconds: number;
  totalSales: number;
}

export function useRoundSocket() {
  const [currentRound, setCurrentRound] = useState<RoundTick | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }
    function onTick(data: RoundTick) {
      setCurrentRound(data);
    }
    function onNewRound(data: RoundTick) {
      setCurrentRound({
        roundId: data.roundId,
        roundNumber: (data as any).number,
        status: 'open',
        remainingSeconds: (data as any).durationSeconds,
        totalSales: 0,
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('round:tick', onTick);
    socket.on('round:new', onNewRound);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('round:tick', onTick);
      socket.off('round:new', onNewRound);
    };
  }, []);

  const requestInitialState = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit('round:request-state');
    }
  }, []);

  return { currentRound, isConnected, requestInitialState };
}
