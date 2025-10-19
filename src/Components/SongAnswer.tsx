import { Button, Flex } from "antd";
import { FaCheck } from "react-icons/fa6";
import type { Field } from "../Context/GameManagementContext";

function SongAnswer({ field, isRevealed, onReveal }: { field: Field, onReveal?: (field: Field) => void, isRevealed?: boolean }) {
  return (
    <Flex vertical gap="small" className={`rounded-full border-1 border-[#424242] !p-1 !pl-3 ${isRevealed ? 'bg-green-800' : ''}`}>
      <Flex justify="space-between" align="center">
        <span>{field.key}: <b>{field.value}</b></span>
        <Flex gap="small">
          <Button size="small" icon={<FaCheck />} shape="circle" onClick={() => onReveal?.(field)} />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SongAnswer;