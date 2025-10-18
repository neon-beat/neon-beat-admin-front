import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import MessageContext from "./MessageContext";
import type { Game, Team, Playlist } from "../Hooks/useNeonBeatGames";

interface ApiContextType {
  sse: EventSource | undefined;
  getGames: () => Promise<Game[]>;
  postGame: (payload: GamePayload) => Promise<Game>;
  startGame: () => Promise<void>;
  getPlaylists: () => Promise<Playlist[]>;
  postPlaylist: (payload: Playlist) => Promise<void>;
  getTeams: () => Promise<Team[]>;
  postTeam: (payload: { name: string; buzzer_id?: string; score: number }) => Promise<void>;
  startAutoPairingTeam: (teamId: string) => Promise<void>;
  isServerReady: boolean | null;
  apiBaseUrl: string;
}

export interface GamePayload {
  name: string,
  players: Team[],
  playlist_id: string;
}

const ApiContext = createContext<ApiContextType | null>(null);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('ApiProvider must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const [isServerReady, setIsServerReady] = useState<boolean | null>(null);
  const [sse, setSse] = useState<EventSource>();

  const searchForBackend = useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/healthcheck`);
    if (!response.ok) {
      throw new Error('Backend not reachable');
    }
    return true;
  }, [apiBaseUrl]);

  const initSse = useCallback(() => {
    const eventSource = new EventSource(`${apiBaseUrl}/sse/admin`);

    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    eventSource.onerror = (error) => {
      messageApi.error('SSE connection error');
      console.error('SSE error:', error);
      eventSource.close();
    };

    setSse(eventSource);
  }, [apiBaseUrl, messageApi]);

  const getGames = useCallback(async (): Promise<Game[]> => {
    const response = await fetch(`${apiBaseUrl}/admin/games`);
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    return response.json();
  }, [apiBaseUrl]);

  const postGame = useCallback(async (payload: GamePayload): Promise<Game> => {
    const response = await fetch(`${apiBaseUrl}/admin/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to create game');
    }
    const data = await response.json();
    return data;
  }, [apiBaseUrl]);

  const getPlaylists = useCallback(async (): Promise<Playlist[]> => {
    const response = await fetch(`${apiBaseUrl}/admin/playlists`);
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    return response.json();
  }, [apiBaseUrl]);

  const postPlaylist = useCallback(async (payload: Playlist): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to import playlist');
    }
  }, [apiBaseUrl]);

  const postTeam = useCallback(async (payload: { name: string; buzzer_id?: string; score: number }): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to create team');
    }
  }, [apiBaseUrl]);

  const getTeams = useCallback(async (): Promise<Team[]> => {
    const response = await fetch(`${apiBaseUrl}/public/teams`);
    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }
    const data = await response.json();
    return data.teams;
  }, [apiBaseUrl]);

  const startGame = useCallback(async (/* gameId: string */): Promise<void> => {
    // const response = await fetch(`${apiBaseUrl}/admin/games/${gameId}/start`, {
    const response = await fetch(`${apiBaseUrl}/admin/game/start`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start game');
    }
  }, [apiBaseUrl]);

  const startAutoPairingTeam = useCallback(async (teamId: string): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/teams/pairing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_team_id: teamId }),
    });
    if (!response.ok) {
      throw new Error('Failed to start auto pairing');
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    searchForBackend()
      .then(() => {
        initSse();
        setIsServerReady(true);
        messageApi.success('Connected to server successfully');
      })
      .catch((error) => {
        setIsServerReady(false);
        messageApi.error(`Error connecting to backend: ${error.message}`);
      });
    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [messageApi, apiBaseUrl, initSse, searchForBackend]);

  const value: ApiContextType = {
    sse,
    getGames,
    postGame,
    startGame,
    getPlaylists,
    postPlaylist,
    getTeams,
    postTeam,
    startAutoPairingTeam,
    isServerReady,
    apiBaseUrl,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;