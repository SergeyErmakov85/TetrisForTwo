import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";
export type GameMode = "versus" | "coop";

interface GameState {
  phase: GamePhase;
  mode: GameMode;
  scoreLimit: number; // Score limit for co-op mode
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  setMode: (mode: GameMode) => void;
  setScoreLimit: (limit: number) => void;
  checkWinCondition: (score: number) => boolean; // Check if score meets win condition
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    mode: "versus", // Default to versus mode
    scoreLimit: 1000, // Default score limit for co-op mode
    
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
    },
    
    setScoreLimit: (limit: number) => {
      set(() => ({ scoreLimit: limit }));
    },
    
    checkWinCondition: (score: number) => {
      const state = get();
      // Only check win condition in co-op mode
      if (state.mode !== "coop") return false;
      return score >= state.scoreLimit;
    }
  }))
);
