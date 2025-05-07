import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";
export type GameMode = "versus" | "coop";

interface GameState {
  phase: GamePhase;
  mode: GameMode;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setMode: (mode: GameMode) => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",
    mode: "versus", // Default to versus mode
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "ready" }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },
    
    setMode: (mode: GameMode) => {
      set(() => ({ mode }));
    }
  }))
);
