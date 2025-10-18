import { Button, Flex, Popconfirm } from "antd";
import type { Game } from "../Hooks/useNeonBeatGames";
import { FaPause, FaPlay, FaStop, FaXmark } from "react-icons/fa6";
import { FaStepForward } from "react-icons/fa";

function GameController({ game }: { game: Game | undefined }) {

  if (game) return (
    <Flex vertical gap="small">
      <h2>{game.name}</h2>
      {/* Game control UI elements will go here */}
      <Flex gap="small" justify="center">
        {game.status === "paused" && <Button type="primary" icon={<FaPlay />} />}
        {game.status === "playing" && <Button type="primary" icon={<FaPause />} />}
        <Button type="primary" icon={<FaStepForward />} />
        <Button type="primary" icon={<FaStop />} />
        <Popconfirm
          title="Are you sure to end the game?"
          onConfirm={() => { }}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger icon={<FaXmark />} />
        </Popconfirm>
      </Flex>
    </Flex>
  );

  return null;
}

export default GameController;