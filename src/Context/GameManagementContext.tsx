import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import MessageContext from "./MessageContext";
import { useApiContext } from "../Hooks/useApiContext";
import type { AnswerFoundPayload, GamePayload } from "./ApiContext";

export interface BlindTestAnswer {
  key: string;
  value: string;
  points: number;
  is_bonus: boolean;
}

export interface MultipleChoiceAnswer {
  text: string;
  is_correct: boolean;
}

export interface OpenAnswer {
  text: string;
}

export interface Hint {
  text: string;
}

export interface BlindTestQuestion {
  type: 'blind_test';
  id: number;
  starts_at_ms: number;
  guess_duration_ms: number;
  url: string;
  answers: Record<string, BlindTestAnswer>;
}

export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: number;
  guess_duration_ms: number;
  prompt: string;
  url?: string;
  answers: Record<string, MultipleChoiceAnswer>;
  hints: Record<string, Hint>;
}

export interface OpenQuestion {
  type: 'open';
  id: number;
  guess_duration_ms: number;
  prompt: string;
  url?: string;
  answers: Record<string, OpenAnswer>;
  hints: Record<string, Hint>;
}

export type Question = BlindTestQuestion | MultipleChoiceQuestion | OpenQuestion;

export interface QuestionsSequenceListItem {
  id: string;
  name: string;
}

export interface QuestionsSequence extends QuestionsSequenceListItem {
  questions?: Question[];
}

export interface Game {
  id: string;
  name: string;
  questions_sequence: QuestionsSequenceListItem;
  teams?: Team[];
  created_at?: string;
  updated_at?: string;
  current_question_index?: number;
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
  questionsSequences: QuestionsSequenceListItem[];
  teams: Team[] | undefined;
  currentTeamPairing: Team | undefined;
  game: Game | undefined;
  question: Question | undefined;
  buzzers: Buzzer[];
  gameState: GameState | undefined;
  setGame: React.Dispatch<React.SetStateAction<Game | undefined>>;
  setTeams: React.Dispatch<React.SetStateAction<Team[] | undefined>>;
  answersFound: number[];
  hintsFound: number[];
  teamIdBuzzing: string | undefined;

  // Actions
  loadSelectedGame: (gameId: string) => Promise<void>;
  loadGames: () => Promise<void>;
  loadQuestionsSequences: () => Promise<void>;
  loadTeams: () => Promise<void>;
  importQuestionsSequence: (payload: { name: string; questions: unknown[] }) => Promise<void>;
  createGame: (payload: GamePayload, shuffle: boolean) => Promise<void>;
  createTeamWithoutBuzzer: (name: string) => Promise<void>;
  markAnswerFound: (questionId: number, answerId: number) => Promise<void>;
  grantTeamPoints: (team: Team, points: number) => Promise<void>;
  resetFoundAnswers: () => void;
  resetWholeGame: () => void;
  setTeamIdBuzzing: React.Dispatch<React.SetStateAction<string | undefined>>;

  // Guards
  canPairTeams: () => boolean;
  canDeleteTeam: () => boolean;
  canStartGame: () => boolean;
  canResumeGame: () => boolean;
  canPauseGame: () => boolean;
  canRevealQuestion: () => boolean;
  canGoNextQuestion: () => boolean;
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

  const { sse, getGames, getGame, postGame, loadGame,
    getCurrentPhase, getQuestionsSequences, postQuestionsSequence, postAnswerFound,
    getTeams, postTeam, isServerReady, postScore,
  } = useApiContext();

  // State
  const [games, setGames] = useState<Game[]>([]);
  const [questionsSequences, setQuestionsSequences] = useState<QuestionsSequenceListItem[]>([]);
  const [teams, setTeams] = useState<Team[] | undefined>(undefined);
  const [currentTeamPairing, setCurrentTeamPairing] = useState<Team | undefined>();
  const [game, setGame] = useState<Game | undefined>();
  const [question, setQuestion] = useState<Question | undefined>();
  const [buzzers] = useState<Buzzer[]>([]);
  const [gameState, setGameState] = useState<GameState | undefined>();
  const [answersFound, setAnswersFound] = useState<number[]>([]);
  const [hintsFound, setHintsFound] = useState<number[]>([]);
  const [teamIdBuzzing, setTeamIdBuzzing] = useState<string | undefined>();

  // Actions
  const loadTeams = useCallback(async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error fetching teams: ${message}`);
    }
  }, [getTeams, messageApi]);

  const loadGames = useCallback(async () => {
    try {
      const data = await getGames();
      setGames(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error fetching games: ${message}`);
    }
  }, [getGames, messageApi]);

  const loadQuestionsSequences = useCallback(async () => {
    try {
      const data = await getQuestionsSequences();
      setQuestionsSequences(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error fetching questions sequences: ${message}`);
    }
  }, [getQuestionsSequences, messageApi]);

  const importQuestionsSequence = useCallback(async (payload: { name: string; questions: unknown[] }) => {
    await postQuestionsSequence(payload);
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Questions sequence imported successfully');
    loadQuestionsSequences();
  }, [postQuestionsSequence, messageApi, loadQuestionsSequences]);

  const createGame = useCallback(async (payload: GamePayload, shuffle: boolean) => {
    const newGame = await postGame(payload, shuffle);
    setGame(newGame);
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game created successfully');
    loadGames();
  }, [postGame, messageApi, loadGames]);

  const createTeamWithoutBuzzer = useCallback(async (name: string) => {
    const payload = {
      name,
      score: 0,
    };

    await postTeam(payload);
    await loadTeams();
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Team created successfully');
  }, [postTeam, loadTeams, messageApi]);

  const loadSelectedGame = useCallback(async (gameId: string) => {
    try {
      const selectedGame = await loadGame(gameId);
      setGame(selectedGame);
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game loaded successfully');
      loadTeams();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error loading game: ${message}`);
    }
  }, [loadGame, messageApi, loadTeams]);

  const markAnswerFound = useCallback(async (questionId: number, answerId: number) => {
    try {
      if (!question) {
        if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error('No question is currently active');
        return;
      }
      const payload: AnswerFoundPayload = { question_id: questionId, answer_id: answerId };
      const data = await postAnswerFound(payload);
      if (data.answers_ids) setAnswersFound(data.answers_ids);
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Answer marked as found');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to mark answer found';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error marking answer found: ${message}`);
    }
  }, [postAnswerFound, messageApi, question]);

  const grantTeamPoints = useCallback(async (team: Team, points: number) => {
    try {
      if (!team.id) {
        if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error('Invalid team ID');
        return;
      }
      await postScore(team.id, points);
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success(`Granted ${points} points to team ${team.name}`);
      loadTeams();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to grant points to team';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error granting points: ${message}`);
    }
  }, [postScore, messageApi, loadTeams]);

  const resetFoundAnswers = useCallback(() => {
    setAnswersFound([]);
    setHintsFound([]);
  }, []);

  const resetWholeGame = useCallback(() => {
    setGame(undefined);
    setTeams(undefined);
    setQuestion(undefined);
    setAnswersFound([]);
    setHintsFound([]);
    setGameState(GameState.IDLE);
  }, []);

  // SSE Event Handlers
  const onPairingAssigned = useCallback((event: MessageEvent) => {
    if (!teams) return;
    const data = JSON.parse(event.data);
    const { team_id, buzzer_id } = data;
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success(`Team ${teams.find((t) => t.id === team_id)?.id} paired with Buzzer ${buzzer_id}`);
    loadTeams();
    setCurrentTeamPairing(undefined);
  }, [teams, messageApi, loadTeams]);

  const onPairingWaiting = useCallback((event: MessageEvent) => {
    if (!teams) return;
    const data = JSON.parse(event.data);
    const { team_id } = data;
    const team = teams.find((t) => t.id === team_id);
    if (!team) {
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Received pairing waiting for unknown team ID: ${team_id}`);
      return;
    }
    setCurrentTeamPairing(team);
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.info(`Team ${team.name} is waiting for buzzer pairing`);
  }, [teams, messageApi]);

  const onPhaseChanged = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { phase } = data;
    setGameState(phase as GameState);
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.info(`Game phase changed to: ${phase}`);
    if (data.question) {
      setQuestion(data.question as Question);
      setAnswersFound(data.answers_ids ?? []);
      setHintsFound(data.hints_ids ?? []);
    } else if (phase !== GameState.PAUSED) {
      // When buzzing pauses the game the back-end omits the question from the
      // snapshot, so preserve the current question so BuzzController can still
      // submit the validation with the correct question_id.
      setQuestion(undefined);
      setAnswersFound([]);
      setHintsFound([]);
    }
    if (data.phase === GameState.PAUSED && data.paused_buzzer) {
      const team = teams?.find(t => t.buzzer_id === data.paused_buzzer);
      if (team) {
        setTeamIdBuzzing(team.id);
      }
    }
  }, [messageApi, teams]);

  const onAnswersFound = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.answers_ids) setAnswersFound(data.answers_ids);
  }, []);

  const onHintsRevealed = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    if (data.hints_ids) setHintsFound(data.hints_ids);
  }, []);

  const onTeamCreated = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { team_name } = data;
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success(`New team created: ${team_name}`);
    loadTeams();
  }, [messageApi, loadTeams]);

  const onTestBuzz = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { buzzer_id } = data;
    if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.info(`Test buzz received from Buzzer ${buzzer_id}`);
  }, [messageApi]);

  // Tests
  const canPairTeams = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PREP_READY) return true;
    return true;
  }, [gameState]);

  const canDeleteTeam = useCallback((): boolean => {
    if (!gameState) return true;
    if (gameState === GameState.PREP_READY) return true;
    return false;
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

  const canRevealQuestion = useCallback((): boolean => {
    if (!gameState) return false;
    if (gameState === GameState.PLAYING) return true;
    return false;
  }, [gameState]);

  const canGoNextQuestion = useCallback((): boolean => {
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
      loadQuestionsSequences();
      getCurrentPhase().then(phaseData => {
        setGameState(phaseData.phase as GameState);
        if (phaseData.question) {
          setQuestion(phaseData.question);
          setAnswersFound(phaseData.answers_ids ?? []);
          setHintsFound(phaseData.hints_ids ?? []);
        }
        if (phaseData.game_id) {
          getGame(phaseData.game_id).then((gameData) => {
            setGame(gameData);
          });
        }
      });
    }
  }, [isServerReady, loadGames, loadQuestionsSequences]);

  useEffect(() => {
    if (!game) return;
    loadTeams();
  }, [game, loadTeams]);

  useEffect(() => {
    if (gameState === GameState.REVEAL) {
      setTeamIdBuzzing(undefined);
    }
  }, [gameState]);

  useEffect(() => {
    if (!sse) return;

    sse.addEventListener('pairing.assigned', onPairingAssigned);
    sse.addEventListener('pairing.waiting', onPairingWaiting);
    sse.addEventListener('phase_changed', onPhaseChanged);
    sse.addEventListener('question.found_answers', onAnswersFound);
    sse.addEventListener('question.hints', onHintsRevealed);
    sse.addEventListener('team.created', onTeamCreated);
    sse.addEventListener('test.buzz', onTestBuzz);

    return () => {
      sse.removeEventListener('pairing.assigned', onPairingAssigned);
      sse.removeEventListener('pairing.waiting', onPairingWaiting);
      sse.removeEventListener('phase_changed', onPhaseChanged);
      sse.removeEventListener('question.found_answers', onAnswersFound);
      sse.removeEventListener('question.hints', onHintsRevealed);
      sse.removeEventListener('team.created', onTeamCreated);
      sse.removeEventListener('test.buzz', onTestBuzz);
    };
  }, [sse, onPairingAssigned, onPairingWaiting, onPhaseChanged, onAnswersFound, onHintsRevealed, onTeamCreated, onTestBuzz]);

  const value: GameManagementContextType = {
    // State
    games,
    questionsSequences,
    teams,
    currentTeamPairing,
    game,
    question,
    buzzers,
    gameState,
    setGame,
    setTeams,
    answersFound,
    hintsFound,
    teamIdBuzzing,

    // Actions
    loadSelectedGame,
    loadGames,
    loadQuestionsSequences,
    loadTeams,
    importQuestionsSequence,
    createGame,
    createTeamWithoutBuzzer,
    markAnswerFound,
    grantTeamPoints,
    resetFoundAnswers,
    resetWholeGame,
    setTeamIdBuzzing,

    // Guards
    canPairTeams,
    canDeleteTeam,
    canStartGame,
    canResumeGame,
    canPauseGame,
    canRevealQuestion,
    canGoNextQuestion,
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