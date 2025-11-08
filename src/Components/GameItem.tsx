import { Button, Flex, Popconfirm } from "antd";
import { FaCheck, FaLink, FaPlay, FaStop, FaXmark } from "react-icons/fa6";
import type { Game } from "../Hooks/useNeonBeatGame";
import TeamPairingModal from "./TeamPairingModal";
import { useState } from "react";
import { useApiContext } from "../Hooks/useApiContext";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import { GiFinishLine } from "react-icons/gi";

function GameItem({ game, isLoadedGame }: { game: Game, isLoadedGame?: boolean }) {
  const { startAutoPairingTeam, startGame, stopGame, endGame, deleteGame } = useApiContext();
  const { loadSelectedGame, loadGames,
    canStartGame, canStopGame, canEndGame, canDeleteGame,
  } = useNeonBeatGame();
  const [buzzerPairingModalOpen, setBuzzerPairingModalOpen] = useState<boolean>(false);
  return (<Flex justify="space-between" align="center" gap="small" className="!p-2 !pl-4 border-1 border-[#424242] rounded-full">
    <Flex vertical className="grow-1">
      <span>{game.name}</span>
      <span className="!text-xs">{game?.created_at ? `Created on ${new Date(game.created_at).toLocaleDateString()}` : 'Unknow creation date'}</span>
    </Flex>
    <Flex gap="small">
      {isLoadedGame === true && <>
        {setBuzzerPairingModalOpen && <Button type="primary" shape="round" icon={<FaLink />} onClick={() => setBuzzerPairingModalOpen(true)} />}
        {startGame && <Button type="primary" shape="round" icon={<FaPlay />} onClick={startGame} disabled={!canStartGame()} />}
        {stopGame && <Button type="primary" shape="round" icon={<FaStop />} onClick={stopGame} disabled={!canStopGame()} />}
        {endGame && <Button type="primary" shape="round" icon={<GiFinishLine />} onClick={endGame} disabled={!canEndGame()} />}
        {deleteGame && <Button type="primary" shape="round" icon={<FaXmark />} onClick={() => deleteGame(game.id)} disabled={!canDeleteGame()} />}
      </>}
      {isLoadedGame === false && <>
        {loadSelectedGame && <Button type="primary" shape="round" icon={<FaCheck />} onClick={() => loadSelectedGame(game.id)} />}
        {deleteGame && (
          <Popconfirm
            title="Are you sure to delete this game?"
            onConfirm={async () => { await deleteGame(game.id); await loadGames(); }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger shape="round" icon={<FaXmark />} />
          </Popconfirm>
        )}
      </>}
    </Flex>
    <TeamPairingModal
      open={buzzerPairingModalOpen}
      onClose={() => setBuzzerPairingModalOpen(false)}
      onAutoPairingClick={(team) => team?.id ? startAutoPairingTeam(team.id) : undefined}
    />
  </Flex>);
}

export default GameItem;
