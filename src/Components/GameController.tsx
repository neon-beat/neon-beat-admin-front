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
  const { game, resetFoundFields, resetWholeGame, canPairTeams, canStartGame, canResumeGame, canPauseGame, canRevealSong, canGoNextSong, canStopGame, canEndGame, isGameRunning } = useNeonBeatGame();
  const { startAutoPairingTeam, startGame, resumeGame, pauseGame, revealSong, nextSong, stopGame, endGame, putTeam } = useApiContext();

  const [isTeamPairingModalOpen, setIsTeamPairingModalOpen] = useState<boolean>(false);

  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('GameController must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const handleStartGame = async () => {
    try {
      await startGame();
      messageApi.success('Game started successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start game';
      messageApi.error(`Error starting game: ${message}`);
    }
  };

  const handleResumeGame = async () => {
    try {
      await resumeGame();
      messageApi.success('Game resumed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resume game';
      messageApi.error(`Error resuming game: ${message}`);
    }
  };

  const handlePauseGame = async () => {
    try {
      await pauseGame();
      messageApi.success('Game paused successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pause game';
      messageApi.error(`Error pausing game: ${message}`);
    }
  };

  const handleRevealSong = async () => {
    try {
      await revealSong();
      messageApi.success('Song reveal successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reveal song';
      messageApi.error(`Error revealing song: ${message}`);
    }
  };

  const handleNextSong = async () => {
    try {
      await nextSong();
      resetFoundFields();
      messageApi.success('Moved to next song');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to move to next song';
      messageApi.error(`Error moving to next song: ${message}`);
    }
  };

  const handleStopGame = async () => {
    try {
      await stopGame();
      messageApi.success('Game stopped successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop game';
      messageApi.error(`Error stopping game: ${message}`);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame();
      resetWholeGame();
      messageApi.success('Game ended successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to end game';
      messageApi.error(`Error ending game: ${message}`);
    }
  };

  const handleManualPairing = async (team: Team, buzzerId: string) => {
    try {
      const updatedTeam = { ...team, buzzer_id: buzzerId };
      await putTeam(updatedTeam as TeamPayload);
      messageApi.success(`Paired team ${team.name} with buzzer ${buzzerId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to pair team';
      messageApi.error(`Error pairing team: ${message}`);
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
        <Button type="primary" icon={<FaEye />} onClick={handleRevealSong} disabled={!canRevealSong()} />
        <Button type="primary" icon={<FaStepForward />} onClick={handleNextSong} disabled={!canGoNextSong()} />
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
        teamList={game.teams}
        onClose={() => setIsTeamPairingModalOpen(false)}
        onManualPairing={handleManualPairing}
        onAutoPairingClick={(team) => team?.id ? startAutoPairingTeam(team.id) : undefined}
      />
    </Flex>
  );

  return null;
}

export default GameController;