
import React, { createContext, useContext, useState } from 'react';

interface Player {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface PlayersContextType {
  players: Player[];
  addPlayer: (player: Omit<Player, 'id'>) => void;
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

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: Date.now().toString(), // Simple ID generation for demo purposes
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  return (
    <PlayersContext.Provider value={{ players, addPlayer }}>
      {children}
    </PlayersContext.Provider>
  );
};
