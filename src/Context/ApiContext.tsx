import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import MessageContext from "./MessageContext";
import type { Game, Player, Playlist } from "../Hooks/useNeonBeatGames";

interface ApiContextType {
  getGames: () => Promise<Game[]>;
  postGame: (payload: GamePayload) => Promise<void>;
  getPlaylists: () => Promise<Playlist[]>;
  postPlaylist: (payload: Playlist) => Promise<void>;
  isServerReady: boolean | null;
  apiBaseUrl: string;
}

interface GamePayload {
  name: string,
  players: Player[],
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
  const sseRef = useRef<EventSource | null>(null);

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
    }

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE message received:', data);
    };

    sseRef.current = eventSource;
  }, [apiBaseUrl, messageApi]);

  const getGames = useCallback(async (): Promise<Game[]> => {
    const response = await fetch(`${apiBaseUrl}/admin/games`);
    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }
    return response.json();
  }, [apiBaseUrl]);

  const postGame = useCallback(async (payload: GamePayload): Promise<void> => {
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
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [messageApi, apiBaseUrl, initSse, searchForBackend]);

  const value: ApiContextType = {
    getGames,
    postGame,
    getPlaylists,
    postPlaylist,
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