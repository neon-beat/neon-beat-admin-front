import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import MessageContext from "./MessageContext";
import type { Game, Team, Playlist, Song } from "../Hooks/useNeonBeatGame";

interface ApiContextType {
  sse: EventSource | undefined;
  getSong: () => Promise<{ song: Song, found_point_fields: string[], found_bonus_fields: string[] }>;
  getGames: () => Promise<Game[]>;
  getGame: (gameId: string) => Promise<Game>;
  postGame: (payload: GamePayload) => Promise<Game>;
  loadGame: (gameId: string) => Promise<Game>;
  startGame: () => Promise<void>;
  stopGame: () => Promise<void>;
  endGame: () => Promise<void>;
  pauseGame: () => Promise<void>;
  revealSong: () => Promise<void>;
  postRevealField: (payload: FieldRevealPayload) => Promise<{ song_id: number, point_fields: string[], bonus_fields: string[] }>;
  resumeGame: () => Promise<void>;
  nextSong: () => Promise<void>;
  putTeam: (payload: TeamPayload) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  validateAnswer: (payload: { valid: string; }) => Promise<void>;
  getCurrentPhase: () => Promise<PhasePayload>;
  getPlaylists: () => Promise<Playlist[]>;
  postPlaylist: (payload: Playlist) => Promise<void>;
  getTeams: () => Promise<Team[]>;
  postTeam: (payload: { name: string; buzzer_id?: string; score: number }) => Promise<void>;
  startAutoPairingTeam: (teamId: string) => Promise<void>;
  postScore: (buzzer_id: string, points: number) => Promise<void>;
  isServerReady: boolean | null;
  apiBaseUrl: string;
  adminToken: string | null;
}

export interface GamePayload {
  name: string,
  teams: Team[],
  playlist_id: string;
}

export interface PhasePayload {
  phase: string;
  degraded: boolean;
  game_id: string | null;
}

export interface TeamPayload {
  id: string;
  name: string;
  buzzer_id?: string;
  score: number;
}

export interface FieldRevealPayload {
  field_key: string;
  kind: string;
  song_id: number;
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
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Helper function to extract error message from response
  const getErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        return errorData.message || errorData.error || fallbackMessage;
      } else {
        const textError = await response.text();
        return textError || fallbackMessage;
      }
    } catch {
      return fallbackMessage;
    }
  };

  // Helper function to create headers for admin endpoints
  const getAdminHeaders = useCallback((additionalHeaders: Record<string, string> = {}): Record<string, string> => {
    const headers: Record<string, string> = {
      ...additionalHeaders,
    };

    if (adminToken) {
      headers['X-Admin-Token'] = adminToken;
    }

    return headers;
  }, [adminToken]);

  const searchForBackend = useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/healthcheck`);
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Backend not reachable');
      throw new Error(errorMessage);
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

  const receiveAdminToken = useCallback((event: MessageEvent) => {
    if (!setAdminToken || !messageApi) return;
    try {
      const data = JSON.parse(event.data);
      if (data.token) setAdminToken(data.token);
      else messageApi.error('Admin token not found in handshake event');
    } catch {
      messageApi.error('Error parsing handshake event for admin token');
    }
  }, [setAdminToken, messageApi]);

  const getSong = useCallback(async (): Promise<{ song: Song, found_point_fields: string[], found_bonus_fields: string[] }> => {
    const response = await fetch(`${apiBaseUrl}/public/song`);
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to fetch song');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl]);

  const getGames = useCallback(async (): Promise<Game[]> => {
    const response = await fetch(`${apiBaseUrl}/admin/games`, {
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to fetch games');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl, getAdminHeaders]);

  const getGame = useCallback(async (gameId: string): Promise<Game> => {
    const response = await fetch(`${apiBaseUrl}/admin/games/${gameId}`, {
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to fetch game');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl, getAdminHeaders]);

  const postGame = useCallback(async (payload: GamePayload): Promise<Game> => {
    const response = await fetch(`${apiBaseUrl}/admin/games`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to create game');
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  }, [apiBaseUrl, getAdminHeaders]);

  const getPlaylists = useCallback(async (): Promise<Playlist[]> => {
    const response = await fetch(`${apiBaseUrl}/admin/playlists`, {
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to fetch playlists');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl, getAdminHeaders]);

  const postPlaylist = useCallback(async (payload: Playlist): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/playlists`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to import playlist');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const postTeam = useCallback(async (payload: { name: string; buzzer_id?: string; score: number }): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/teams`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to create team');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const getTeams = useCallback(async (): Promise<Team[]> => {
    const response = await fetch(`${apiBaseUrl}/public/teams`);
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to fetch teams');
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.teams;
  }, [apiBaseUrl]);

  const loadGame = useCallback(async (gameId: string): Promise<Game> => {
    const response = await fetch(`${apiBaseUrl}/admin/games/${gameId}/load`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to load game');
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  }, [apiBaseUrl, getAdminHeaders]);

  const startGame = useCallback(async (/* gameId: string */): Promise<void> => {
    // const response = await fetch(`${apiBaseUrl}/admin/games/${gameId}/start`, {
    const response = await fetch(`${apiBaseUrl}/admin/game/start`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to start game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const stopGame = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/stop`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to stop game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const endGame = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/end`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to end game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const pauseGame = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/pause`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to pause game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const revealSong = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/reveal`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to reveal song');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const postRevealField = useCallback(async (payload: FieldRevealPayload): Promise<{ song_id: number, point_fields: string[], bonus_fields: string[] }> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/fields/found`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to reveal field');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl, getAdminHeaders]);

  const resumeGame = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/resume`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to resume game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const nextSong = useCallback(async (): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/next`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to skip to next song');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const getCurrentPhase = useCallback(async (): Promise<PhasePayload> => {
    const response = await fetch(`${apiBaseUrl}/public/phase`);
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to get current phase');
      throw new Error(errorMessage);
    }
    return response.json();
  }, [apiBaseUrl]);

  const startAutoPairingTeam = useCallback(async (teamId: string): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/teams/pairing`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ first_team_id: teamId }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to start auto pairing');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const putTeam = useCallback(async (payload: TeamPayload): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/teams/${payload.id}`, {
      method: 'PUT',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ name: payload.name, buzzer_id: payload.buzzer_id, score: payload.score }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to update team');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const postScore = useCallback(async (buzzer_id: string, delta: number): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/game/score`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ buzzer_id, delta }),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to post score');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const deleteGame = useCallback(async (gameId: string): Promise<void> => {
    const response = await fetch(`${apiBaseUrl}/admin/games/${gameId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to delete game');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  const validateAnswer = useCallback(async (payload: { valid: string; }) => {
    const response = await fetch(`${apiBaseUrl}/admin/game/answer`, {
      method: 'POST',
      headers: getAdminHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response, 'Failed to validate answer');
      throw new Error(errorMessage);
    }
  }, [apiBaseUrl, getAdminHeaders]);

  useEffect(() => {
    searchForBackend()
      .then(() => {
        initSse();
        messageApi.success('Connected to server successfully');
      })
      .catch((error) => {
        messageApi.error(`Error connecting to backend: ${error.message}`);
      });
  }, [messageApi, apiBaseUrl, initSse, searchForBackend]);

  useEffect(() => {
    if (!sse || !receiveAdminToken) return;
    sse.addEventListener('handshake', receiveAdminToken);

    return () => {
      sse.removeEventListener('handshake', receiveAdminToken);
    };
  }, [sse, receiveAdminToken]);

  useEffect(() => {
    if (!adminToken) return;
    setIsServerReady(true);
  }, [adminToken]);

  const value: ApiContextType = {
    sse,
    isServerReady,
    apiBaseUrl,
    adminToken,

    // Getters
    getSong,
    getGames,
    getPlaylists,
    getGame,
    getTeams,
    getCurrentPhase,

    // Postters
    postPlaylist,
    postTeam,
    postScore,

    // Manage Game
    postGame,
    loadGame,
    startGame,
    stopGame,
    endGame,
    pauseGame,
    revealSong,
    postRevealField,
    resumeGame,
    nextSong,
    startAutoPairingTeam,
    putTeam,
    deleteGame,
    validateAnswer,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;