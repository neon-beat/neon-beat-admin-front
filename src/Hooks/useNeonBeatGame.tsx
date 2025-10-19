import { useGameManagement } from "./useGameManagement";

// Re-export interfaces for backward compatibility
export type {
  Field,
  Song,
  Game,
  Playlist,
  Team,
  Buzzer,
} from "../Context/GameManagementContext";

const useNeonBeatGame = () => {
  return useGameManagement();
};

export default useNeonBeatGame;
