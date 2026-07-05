import React, { createContext, useContext, useState } from 'react';
import { RoomState } from '../../../shared/interfaces';

interface GameContextProps {
  roomState: RoomState | null;
  setRoomState: (state: RoomState | null) => void;
}

const GameContext = createContext<GameContextProps>({
  roomState: null,
  setRoomState: () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  return (
    <GameContext.Provider value={{ roomState, setRoomState }}>
      {children}
    </GameContext.Provider>
  );
};
