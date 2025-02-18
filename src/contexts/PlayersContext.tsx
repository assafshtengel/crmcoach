import React, { createContext, useContext, useState } from 'react';

export interface Player {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Session {
  id: string;
  date: string;
  time: string;
  playerId: string;
  playerName: string;
  description: string;
}

export interface Coach {
  fullName: string;
  email: string;
  phone: string;
  description: string;
}

interface PlayersContextType {
  players: Player[];
  sessions: Session[];
  coach: Coach;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (playerId: string, updatedData: Omit<Player, 'id'>) => void;
  deletePlayer: (playerId: string) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  updateSession: (sessionId: string, updatedData: Omit<Session, 'id'>) => void;
  deleteSession: (sessionId: string) => void;
  updateCoach: (data: Partial<Coach>) => void;
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
  const [coach, setCoach] = useState<Coach>({
    fullName: '',
    email: '',
    phone: '',
    description: ''
  });

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer = {
      ...player,
      id: Date.now().toString(),
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (playerId: string, updatedData: Omit<Player, 'id'>) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === playerId
          ? { ...player, ...updatedData }
          : player
      )
    );

    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.playerId === playerId
          ? { ...session, playerName: updatedData.name }
          : session
      )
    );
  };

  const deletePlayer = (playerId: string) => {
    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
    setSessions(prevSessions => prevSessions.filter(session => session.playerId !== playerId));
  };

  const addSession = (session: Omit<Session, 'id'>) => {
    const newSession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateSession = (sessionId: string, updatedData: Omit<Session, 'id'>) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, ...updatedData }
          : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
  };

  const updateCoach = (data: Partial<Coach>) => {
    setCoach(prev => ({ ...prev, ...data }));
  };

  return (
    <PlayersContext.Provider value={{ 
      players, 
      sessions, 
      coach,
      addPlayer, 
      updatePlayer, 
      deletePlayer, 
      addSession,
      updateSession,
      deleteSession,
      updateCoach
    }}>
      {children}
    </PlayersContext.Provider>
  );
};
