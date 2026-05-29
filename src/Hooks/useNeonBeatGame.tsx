import { useGameManagement } from "./useGameManagement";

// Re-export types for external use
export type {
  BlindTestAnswer,
  MultipleChoiceAnswer,
  OpenAnswer,
  Hint,
  BlindTestQuestion,
  MultipleChoiceQuestion,
  OpenQuestion,
  Question,
  QuestionsSequenceListItem,
  QuestionsSequence,
  Game,
  Team,
  Buzzer,
} from "../Context/GameManagementContext";

const useNeonBeatGame = () => {
  return useGameManagement();
};

export default useNeonBeatGame;
