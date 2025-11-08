import type { Team } from "../Context/GameManagementContext";
import { Button, Flex } from "antd";
import '../css/buzzer-item.css';
import { IoCheckmarkDoneSharp, IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { useApiContext } from "../Hooks/useApiContext";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import { useContext } from "react";
import MessageContext from "../Context/MessageContext";

function BuzzController({ team }: { team?: Team }) {
  const { validateAnswer } = useApiContext();
  const { setTeamIdBuzzing } = useNeonBeatGame();
  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('BuzzController must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const handleClickCorrect = async () => {
    try {
      await validateAnswer({ valid: 'correct' });
      setTeamIdBuzzing(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate answer';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error validating answer: ${message}`);
    }
  };

  const handleClickHalf = async () => {
    try {
      await validateAnswer({ valid: 'incomplete' });
      setTeamIdBuzzing(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate answer';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error validating answer: ${message}`);
    }
  };

  const handleClickWrong = async () => {
    try {
      await validateAnswer({ valid: 'wrong' });
      setTeamIdBuzzing(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate answer';
      if (import.meta.env.VITE_DEBUG_LEVEL !== 'none') messageApi.error(`Error validating answer: ${message}`);
    }
  };

  return <Flex className="buzzer-item w-full" justify="space-between" align="center">
    <span>{team?.name}</span>
    <Flex gap="large">
      <Button type="text" icon={<IoCheckmarkDoneSharp color="green" />} onClick={handleClickCorrect} />
      <Button type="text" icon={<IoCheckmarkSharp color="orange" />} onClick={handleClickHalf} />
      <Button type="text" icon={<IoCloseSharp color="red" />} onClick={handleClickWrong} />
    </Flex>
  </Flex>;
}

export default BuzzController;
