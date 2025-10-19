import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import MessageContext from "./MessageContext";
import { useApiContext } from "../Hooks/useApiContext";
import type { FieldRevealPayload, GamePayload } from "./ApiContext";

// Re-export interfaces for external use
export interface Field {
  key: string;
  points: number;
  value: string;
}

export interface Song {
  id: string;
  bonus_fields: Field[];
  guess_duration_ms: number;
  point_fields: Field[];
  starts_at_ms: number;
  url: string;
}

export interface Game {
  id: string;
  name: string;
  playlist: Playlist;
  teams?: Team[];
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

export interface Team {
  id?: string;
  buzzer_id?: string;
  name: string;
  score?: number;
}

export interface Buzzer {
  id: string;
}

export const GameState = {
  IDLE: 'idle',
  PREP_READY: 'prep_ready',
  PAIRING: 'pairing',
  PLAYING: 'playing',
  PAUSED: 'pause',
  REVEAL: 'reveal',
  SCORES: 'scores',
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

interface GameManagementContextType {
  // State
  games: Game[];
  playlists: Playlist[];
  teams: Team[] | undefined;
  currentTeamPairing: Team | undefined;
  game: Game | undefined;
  song: Song | undefined;
  buzzers: Buzzer[];
  gameState: GameState | undefined;
  setGame: React.Dispatch<React.SetStateAction<Game | undefined>>;
  setTeams: React.Dispatch<React.SetStateAction<Team[] | undefined>>;
  pointFieldsFound: string[];
  bonusFieldsFound: string[];

  // Actions
  loadSelectedGame: (gameId: string) => Promise<void>;
  loadGames: () => Promise<void>;
  loadPlaylists: () => Promise<void>;
  loadTeams: () => Promise<void>;
  importPlaylist: (payload: Playlist) => Promise<void>;
  createGameWithPlaylist: (payload: GamePayload) => Promise<void>;
  createTeamWithoutBuzzer: (name: string) => Promise<void>;
  revealField: (field: Field, kind: string) => Promise<void>;
  grantTeamPoints: (team: Team, points: number) => Promise<void>;

  // Tests
  canPairTeams: () => boolean;
  canStartGame: () => boolean;
  canResumeGame: () => boolean;
  canPauseGame: () => boolean;
  canRevealSong: () => boolean;
  canGoNextSong: () => boolean;
  canStopGame: () => boolean;
  canEndGame: () => boolean;
  canDeleteGame: () => boolean;
  showGameList: () => boolean;
  isGameRunning: () => boolean;
}

const GameManagementContext = createContext<GameManagementContextType | null>(null);

interface GameManagementProviderProps {
  children: ReactNode;
}

export const GameManagementProvider: React.FC<GameManagementProviderProps> = ({ children }) => {
  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('GameManagementProvider must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const { sse, getSong, getGames, getGame, postGame, loadGame,
    getCurrentPhase, getPlaylists, postPlaylist, postRevealField,
    getTeams, postTeam, isServerReady, postScore,
  } = useApiContext();

  // State
  const [games, setGames] = useState<Game[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [teams, setTeams] = useState<Team[] | undefined>(undefined);
  const [currentTeamPairing, setCurrentTeamPairing] = useState<Team | undefined>();
  const [game, setGame] = useState<Game | undefined>();
  const [song, setSong] = useState<Song | undefined>();
  const [buzzers] = useState<Buzzer[]>([]);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [pointFieldsFound, setPointFieldsFound] = useState<string[]>([]);
  const [bonusFieldsFound, setBonusFieldsFound] = useState<string[]>([]);

  // Actions
  const loadTeams = useCallback(async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      messageApi.error(`Error fetching teams: ${message}`);
    }
  }, [getTeams, messageApi]);

  const loadGames = useCallback(async () => {
    try {
      const data = await getGames();
      setGames(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      messageApi.error(`Error fetching games: ${message}`);
    }
  }, [getGames, messageApi]);

  const loadPlaylists = useCallback(async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      messageApi.error(`Error fetching playlists: ${message}`);
    }
  }, [getPlaylists, messageApi]);

  const importPlaylist = useCallback(async (payload: Playlist) => {
    await postPlaylist(payload);
    messageApi.success('Playlist imported successfully');
    loadPlaylists();
  }, [postPlaylist, messageApi, loadPlaylists]);

  const createGameWithPlaylist = useCallback(async (payload: GamePayload) => {
    const newGame = await postGame(payload);
    setGame(newGame);
    messageApi.success('Game created successfully');
    loadGames();
  }, [postGame, messageApi, loadGames]);

  const createTeamWithoutBuzzer = useCallback(async (name: string) => {
    const payload = {
      name,
      score: 0,
    };

    await postTeam(payload);
    await loadTeams();
    messageApi.success('Team created successfully');
  }, [postTeam, loadTeams, messageApi]);

  const loadSelectedGame = useCallback(async (gameId: string) => {
    try {
      const selectedGame = await loadGame(gameId);
      setGame(selectedGame);
      messageApi.success('Game loaded successfully');
      loadTeams();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      messageApi.error(`Error loading game: ${message}`);
    }
  }, [loadGame, messageApi, loadTeams]);

  const revealField = useCallback(async (field: Field, kind: string) => {
    try {
      if (!song) {
        messageApi.error('No song is currently active');
        return;
      }
      const payload: FieldRevealPayload = {
        field_key: field.key,
        kind,
        song_id: parseInt(song.id, 10),
      }
      const data = await postRevealField(payload);
      if (data.point_fields) {
        setPointFieldsFound(data.point_fields);
      }
      if (data.bonus_fields) {
        setBonusFieldsFound(data.bonus_fields);
      }
      messageApi.success(`Field ${field.key} revealed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal field';
      messageApi.error(`Error revealing field: ${message}`);
    }
  }, [postRevealField, messageApi, song]);

  const grantTeamPoints = useCallback(async (team: Team, points: number) => {
    try {
      if (!team.buzzer_id) {
        messageApi.error(`Team ${team.name} is not paired with a buzzer`);
        return;
      }
      await postScore(team.buzzer_id, points);
      messageApi.success(`Granted ${points} points to team ${team.name}`);
      loadTeams();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to grant points to team';
      messageApi.error(`Error granting points: ${message}`);
    }
  }, [postTeam, messageApi, loadTeams]);

  // SSE Event Handlers
  const onPairingAssigned = useCallback((event: MessageEvent) => {
    if (!teams) return;
    const data = JSON.parse(event.data);
    const { team_id, buzzer_id } = data;
    messageApi.success(`Team ${teams.find((t) => t.id === team_id)?.id} paired with Buzzer ${buzzer_id}`);
    loadTeams();
    setCurrentTeamPairing(undefined);
  }, [teams, messageApi, loadTeams]);

  const onPairingWaiting = useCallback((event: MessageEvent) => {
    if (!teams) return;
    const data = JSON.parse(event.data);
    const { team_id } = data;
    const team = teams.find((t) => t.id === team_id);
    if (!team) {
      messageApi.error(`Received pairing waiting for unknown team ID: ${team_id}`);
      return;
    }
    setCurrentTeamPairing(team);
    messageApi.info(`Team ${team.name} is waiting for buzzer pairing`);
  }, [teams, messageApi]);

  const onPhaseChanged = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { phase } = data;
    setGameState(phase as GameState);
    messageApi.info(`Game phase changed to: ${phase}`);
    if (data.song) {
      setSong(data.song as Song);
      if (data.found_point_fields) setPointFieldsFound(data.found_point_fields);
      if (data.found_bonus_fields) setBonusFieldsFound(data.found_bonus_fields);
    }
  }, [messageApi]);

  const onTeamCreated = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { team_name } = data;
    messageApi.success(`New team created: ${team_name}`);
    loadTeams();
  }, [messageApi, loadTeams]);

  const onTestBuzz = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { buzzer_id } = data;
    messageApi.info(`Test buzz received from Buzzer ${buzzer_id}`);
  }, [messageApi]);

  // Tests
  const canPairTeams = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PREP_READY) return true;
    return true;
  }, [gameState]);

  const canStartGame = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PREP_READY) return true;
    return false;
  }, [gameState]);

  const canResumeGame = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PAUSED) return true;
    return false;
  }, [gameState]);

  const canPauseGame = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PLAYING) return true;
    return false;
  }, [gameState]);

  const canRevealSong = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PLAYING) return true;
    return false;
  }, [gameState]);

  const canGoNextSong = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.REVEAL) return true;
    return false;
  }, [gameState]);

  const canStopGame = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PLAYING) return true;
    if (gameState === GameState.PAUSED) return true;
    if (gameState === GameState.PAIRING) return true;
    if (gameState === GameState.PREP_READY) return true;
    if (gameState === GameState.REVEAL) return true;
    return false;
  }, [gameState]);

  const canEndGame = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.SCORES) return true;
    return false;
  }, [gameState]);

  const canDeleteGame = useCallback((): boolean => {
    if (!gameState) return true;
    if (gameState === GameState.IDLE) return true;
    if (gameState === GameState.SCORES) return true;
    return false;
  }, [gameState]);

  const showGameList = useCallback((): boolean => {
    if (!gameState) return true;
    if (gameState === GameState.IDLE) return true;
    return false;
  }, [gameState]);

  const isGameRunning = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PLAYING) return true;
    if (gameState === GameState.PAUSED) return true;
    if (gameState === GameState.REVEAL) return true;
    return false;
  }, [gameState]);

  // Effects
  useEffect(() => {
    if (isServerReady) {
      loadGames();
      loadPlaylists();
      getCurrentPhase().then(phaseData => {
        setGameState(phaseData.phase as GameState);
        if (phaseData.phase === GameState.PLAYING) {
          getSong().then((songData) => {
            setSong(songData.song);
            setPointFieldsFound(songData.found_point_fields);
            setBonusFieldsFound(songData.found_bonus_fields);
          });
        }
        if (phaseData.game_id) {
          getGame(phaseData.game_id).then((gameData) => {
            setGame(gameData);
          });
        }
      });
    }
  }, [isServerReady, loadGames, loadPlaylists]);

  useEffect(() => {
    if (!game) return;
    loadTeams();
  }, [game, loadTeams]);

  useEffect(() => {
    if (!sse) return;

    sse.addEventListener('pairing.assigned', onPairingAssigned);
    sse.addEventListener('pairing.waiting', onPairingWaiting);
    sse.addEventListener('phase_changed', onPhaseChanged);
    sse.addEventListener('team.created', onTeamCreated);
    sse.addEventListener('test.buzz', onTestBuzz);

    return () => {
      sse.removeEventListener('pairing.assigned', onPairingAssigned);
      sse.removeEventListener('pairing.waiting', onPairingWaiting);
      sse.removeEventListener('phase_changed', onPhaseChanged);
      sse.removeEventListener('team.created', onTeamCreated);
      sse.removeEventListener('test.buzz', onTestBuzz);
    };
  }, [sse, onPairingAssigned, onPairingWaiting, onPhaseChanged, onTeamCreated, onTestBuzz]);

  const value: GameManagementContextType = {
    // State
    games,
    playlists,
    teams,
    currentTeamPairing,
    game,
    song,
    buzzers,
    gameState,
    setGame,
    setTeams,
    pointFieldsFound,
    bonusFieldsFound,

    // Actions
    loadSelectedGame,
    loadGames,
    loadPlaylists,
    loadTeams,
    importPlaylist,
    createGameWithPlaylist,
    createTeamWithoutBuzzer,
    revealField,
    grantTeamPoints,

    // Tests
    canPairTeams,
    canStartGame,
    canResumeGame,
    canPauseGame,
    canRevealSong,
    canGoNextSong,
    canStopGame,
    canEndGame,
    canDeleteGame,
    showGameList,
    isGameRunning,
  };

  return (
    <GameManagementContext.Provider value={value}>
      {children}
    </GameManagementContext.Provider>
  );
};

export default GameManagementContext;