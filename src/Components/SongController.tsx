import { Flex, Typography } from "antd";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import SongAnswer from "./SongAnswer";

function SongController() {
  const { question, markAnswerFound, answersFound } = useNeonBeatGame();

  if (!question) {
    return <div>No question currently active</div>;
  }

  if (question.type === 'blind_test') {
    return (
      <Flex vertical gap="small" className="grow-1">
        {Object.entries(question.answers).map(([idStr, answer]) => {
          const answerId = parseInt(idStr, 10);
          const label = answer.is_bonus
            ? `[Bonus] ${answer.key}: ${answer.value}`
            : `${answer.key}: ${answer.value}`;
          return (
            <SongAnswer
              key={idStr}
              label={label}
              isRevealed={answersFound.includes(answerId)}
              onReveal={() => markAnswerFound(question.id, answerId)}
            />
          );
        })}
      </Flex>
    );
  }

  if (question.type === 'multiple_choice') {
    return (
      <Flex vertical gap="small" className="grow-1">
        <Typography.Text strong>{question.prompt}</Typography.Text>
        {Object.entries(question.answers).map(([idStr, answer]) => {
          const answerId = parseInt(idStr, 10);
          return (
            <SongAnswer
              key={idStr}
              label={answer.text}
              isRevealed={answersFound.includes(answerId)}
              onReveal={() => markAnswerFound(question.id, answerId)}
            />
          );
        })}
      </Flex>
    );
  }

  if (question.type === 'open') {
    return (
      <Flex vertical gap="small" className="grow-1">
        <Typography.Text strong>{question.prompt}</Typography.Text>
        {Object.entries(question.answers).map(([idStr, answer]) => {
          const answerId = parseInt(idStr, 10);
          return (
            <SongAnswer
              key={idStr}
              label={answer.text}
              isRevealed={answersFound.includes(answerId)}
              onReveal={() => markAnswerFound(question.id, answerId)}
            />
          );
        })}
      </Flex>
    );
  }

  return null;
}

export default SongController;
