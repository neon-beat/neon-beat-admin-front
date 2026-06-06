import { Flex, Typography } from "antd";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import SongAnswer from "./SongAnswer";

function SongController() {
  const { question, markAnswerFound, answersFound, hintsFound } = useNeonBeatGame();
  // Hint reveal wiring kept here for quick reactivation when player front supports it.
  // const { postHint } = useApiContext();
  // const messageContext = useContext(MessageContext);
  // if (!messageContext) {
  //   throw new Error('SongController must be used within a MessageContext.Provider');
  // }
  // const { messageApi } = messageContext;

  if (!question) {
    return <div>No question currently active</div>;
  }

  // const handleRevealHint = async (hintId: number) => {
  //   if (!question) return;
  //   try {
  //     await postHint({ question_id: question.id, hint_id: hintId });
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Failed to reveal hint';
  //     if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error revealing hint: ${message}`);
  //   }
  // };

  const renderHints = () => {
    if (question.type !== 'multiple_choice' && question.type !== 'open') return null;
    const hintEntries = Object.entries(question.hints);
    if (hintEntries.length === 0) return null;

    return (
      <Flex vertical gap="small" className="rounded-2xl border-1 border-[#424242] !p-3">
        <Typography.Text strong>Hints</Typography.Text>
        <Flex vertical gap="small">
          {hintEntries.map(([idStr, hint]) => {
            const hintId = parseInt(idStr, 10);
            const isRevealed = hintsFound.includes(hintId);

            return (
              <Flex
                key={idStr}
                justify="space-between"
                align="center"
                gap="small"
                className={`rounded-xl border-1 border-[#424242] !px-3 !py-2 ${isRevealed ? 'bg-green-900/40' : ''}`}
              >
                <Flex vertical className="min-w-0 grow-1">
                  <span className="!text-xs text-neutral-400">Hint {hintId + 1}</span>
                  <span className="break-words">{hint.text}</span>
                </Flex>
                {/*
                  Hint reveal button intentionally disabled for now.
                  Uncomment this block and the reveal wiring above to re-enable.
                */}
                {/*
                <Button
                  size="small"
                  type={isRevealed ? "default" : "primary"}
                  icon={isRevealed ? <FaCheck /> : <FaEye />}
                  onClick={() => handleRevealHint(hintId)}
                  disabled={isRevealed}
                >
                  {isRevealed ? 'Revealed' : 'Reveal'}
                </Button>
                */}
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    );
  };

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
        {renderHints()}
        {Object.entries(question.answers).map(([idStr, answer]) => {
          const answerId = parseInt(idStr, 10);
          return (
            <SongAnswer
              key={idStr}
              label={answer.text}
              isRevealed={answersFound.includes(answerId)}
              isCorrect={answer.is_correct}
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
        {renderHints()}
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
