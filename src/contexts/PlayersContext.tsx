
import React, { createContext, useContext, useState } from 'react';

interface Player {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface Session {
  id: string;
  date: string;
  time: string;
  playerId: string;
  playerName: string;
  description: string;
}

interface PlayersContextType {
  players: Player[];
  sessions: Session[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export const usePlayers = () => {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within a PlayersProvider');
  }
  return context;
};

export const PlayersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: Date.now().toString(),
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const addSession = (session: Omit<Session, 'id'>) => {
    const newSession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions(prev => [...prev, newSession]);
  };

  return (
    <PlayersContext.Provider value={{ players, sessions, addPlayer, addSession }}>
      {children}
    </PlayersContext.Provider>
  );
};
