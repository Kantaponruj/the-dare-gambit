import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSocket } from "../../context/SocketContext";

export type TournamentFormat =
  | "single_elimination"
  | "double_elimination"
  | "round_robin";

export interface TournamentConfig {
  format: TournamentFormat;
  teamCount: number; // e.g. 4,8,16
  maxRoundsPerMatch: number; // limit rounds/cards per match
  createdAt: number;
}

interface TournamentContextValue {
  config: TournamentConfig | null;
  createTournament: (data: Omit<TournamentConfig, "createdAt">) => void;
  resetTournament: () => void;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(
  undefined
);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TournamentConfig | null>(null);

  // Hydrate from localStorage if available.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tournament.config");
      if (raw) {
        const parsed = JSON.parse(raw) as TournamentConfig;
        setConfig(parsed);
      }
    } catch (e) {
      // swallow
    }
  }, []);

  // Sync with Socket
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on("tournament:state", (tournament: any) => {
      console.log("TournamentContext received tournament:state", tournament);
      if (tournament) {
        // Map server tournament to local config format for compatibility
        const newConfig: TournamentConfig = {
          format: "single_elimination", // Default
          teamCount: tournament.maxTeams,
          maxRoundsPerMatch: 5,
          createdAt: Date.now(),
        };
        console.log("Setting config:", newConfig);
        setConfig(newConfig);
        localStorage.setItem("tournament.config", JSON.stringify(newConfig));
      }
    });
    return () => {
      socket.off("tournament:state");
    };
  }, [socket]);

  function createTournament(data: Omit<TournamentConfig, "createdAt">) {
    const next = { ...data, createdAt: Date.now() } as TournamentConfig;
    setConfig(next);
    try {
      localStorage.setItem("tournament.config", JSON.stringify(next));
    } catch {}
  }

  function resetTournament() {
    setConfig(null);
    try {
      localStorage.removeItem("tournament.config");
    } catch {}
  }

  return (
    <TournamentContext.Provider
      value={{ config, createTournament, resetTournament }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx)
    throw new Error("useTournament must be used inside TournamentProvider");
  return ctx;
}
