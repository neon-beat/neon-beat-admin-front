import { Button, Flex, Popconfirm } from "antd";
import { useContext, useState } from "react";
import type { Team } from "../Hooks/useNeonBeatGame";
import { FaEye, FaLink, FaPause, FaPlay, FaStop } from "react-icons/fa6";
import { FaStepForward } from "react-icons/fa";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import { useApiContext } from "../Hooks/useApiContext";
import MessageContext from "../Context/MessageContext";
import { GiFinishLine } from "react-icons/gi";
import TeamPairingModal from "./TeamPairingModal";
import type { TeamPayload } from "../Context/ApiContext";

function GameController() {
  const { game, question, answersFound, markAnswerFound, resetFoundAnswers, resetWholeGame, canPairTeams, canStartGame, canResumeGame, canPauseGame, canRevealQuestion, canGoNextQuestion, canStopGame, canEndGame, isGameRunning } = useNeonBeatGame();
  const { startAutoPairingTeam, startGame, resumeGame, pauseGame, revealQuestion, nextQuestion, stopGame, endGame, putTeam } = useApiContext();

  const [isTeamPairingModalOpen, setIsTeamPairingModalOpen] = useState<boolean>(false);

  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('GameController must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const handleStartGame = async () => {
    try {
      await startGame();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game started successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start game';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error starting game: ${message}`);
    }
  };

  const handleResumeGame = async () => {
    try {
      await resumeGame();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game resumed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resume game';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error resuming game: ${message}`);
    }
  };

  const handlePauseGame = async () => {
    try {
      await pauseGame();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game paused successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pause game';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error pausing game: ${message}`);
    }
  };

  const handleRevealQuestion = async () => {
    try {
      await revealQuestion();
      // For open/multiple_choice questions, automatically reveal all answers
      if (question && (question.type === 'open' || question.type === 'multiple_choice')) {
        for (const [idStr] of Object.entries(question.answers)) {
          const answerId = parseInt(idStr, 10);
          if (!answersFound.includes(answerId)) {
            await markAnswerFound(question.id, answerId);
          }
        }
      }
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Question revealed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal question';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error revealing question: ${message}`);
    }
  };

  const handleNextQuestion = async () => {
    try {
      await nextQuestion();
      resetFoundAnswers();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Moved to next question');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move to next question';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error moving to next question: ${message}`);
    }
  };

  const handleStopGame = async () => {
    try {
      await stopGame();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game stopped successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop game';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error stopping game: ${message}`);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame();
      resetWholeGame();
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success('Game ended successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end game';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error ending game: ${message}`);
    }
  };

  const handleManualPairing = async (team: Team, buzzerId: string) => {
    try {
      const updatedTeam = { ...team, buzzer_id: buzzerId };
      await putTeam(updatedTeam as TeamPayload);
      if (import.meta.env.VITE_DEBUG_LEVEL === 'info') messageApi.success(`Paired team ${team.name} with buzzer ${buzzerId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pair team';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error pairing team: ${message}`);
    }
  };

  if (game) return (
    <Flex vertical gap="small">
      {/* Game control UI elements will go here */}
      <Flex gap="small" justify="center" wrap>
        <Button type="primary" icon={<FaLink />} onClick={() => setIsTeamPairingModalOpen(true)} disabled={!canPairTeams()} />
        {isGameRunning() === true
          ? <Button type="primary" icon={<FaPlay />} onClick={handleResumeGame} disabled={!canResumeGame()} />
          : <Button type="primary" icon={<FaPlay />} onClick={handleStartGame} disabled={!canStartGame()} />
        }
        <Button type="primary" icon={<FaPause />} onClick={handlePauseGame} disabled={!canPauseGame()} />
        <Button type="primary" icon={<FaEye />} onClick={handleRevealQuestion} disabled={!canRevealQuestion()} />
        <Button type="primary" icon={<FaStepForward />} onClick={handleNextQuestion} disabled={!canGoNextQuestion()} />
        <Button type="primary" icon={<GiFinishLine />} onClick={handleStopGame} disabled={!canStopGame()} />
        <Popconfirm
          title="Are you sure to end the game?"
          onConfirm={handleEndGame}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger icon={<FaStop />} disabled={!canEndGame()} />
        </Popconfirm>
      </Flex>
      <TeamPairingModal
        open={isTeamPairingModalOpen}
        onClose={() => setIsTeamPairingModalOpen(false)}
        onManualPairing={handleManualPairing}
        onAutoPairingClick={(team) => team?.id ? startAutoPairingTeam(team.id) : undefined}
      />
    </Flex>
  );

  return null;
}

export default GameController;