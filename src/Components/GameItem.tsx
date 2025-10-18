import { Button, Flex } from "antd";
import { FaLink, FaPlay } from "react-icons/fa6";
import type { Game, Team } from "../Hooks/useNeonBeatGames";
import TeamPairingModal from "./TeamPairingModal";
import { useState } from "react";
import { useApiContext } from "../Hooks/useApiContext";

function GameItem({ game, teamList, buzzerList }: { game: Game, teamList: Team[], buzzerList: { id: string; }[] }) {
  const { startAutoPairingTeam, startGame } = useApiContext();
  const [buzzerPairingModalOpen, setBuzzerPairingModalOpen] = useState<boolean>(false);
  return (<Flex justify="space-between" align="center" gap="small" className="!p-2 !pl-4 border-1 border-[#424242] rounded-full">
    <Flex vertical className="grow-1">
      <span>{game.name}</span>
      <span className="!text-xs">{game?.created_at ? `Created on ${new Date(game.created_at).toLocaleDateString()}` : 'Unknow creation date'}</span>
    </Flex>
    <Flex gap="small">
      <Button type="primary" shape="round" icon={<FaLink />} onClick={() => setBuzzerPairingModalOpen(true)} />
      <Button type="primary" shape="round" icon={<FaPlay />} onClick={startGame} />
    </Flex>
    <TeamPairingModal
      open={buzzerPairingModalOpen}
      onClose={() => setBuzzerPairingModalOpen(false)}
      teamList={teamList}
      buzzerList={buzzerList}
      onAutoPairingClick={(team) => team?.id ? startAutoPairingTeam(team.id) : undefined}
    />
  </Flex>);
}

export default GameItem;
