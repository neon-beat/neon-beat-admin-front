import { Button, Flex } from "antd";
import { FaCheck } from "react-icons/fa6";

function SongAnswer({ label, isRevealed, onReveal }: { label: string; onReveal?: () => void; isRevealed?: boolean }) {
  return (
    <Flex vertical gap="small" className={`rounded-full border-1 border-[#424242] !p-1 !pl-3 ${isRevealed ? 'bg-green-800' : ''}`}>
      <Flex justify="space-between" align="center">
        <span>{label}</span>
        <Flex gap="small">
          <Button size="small" icon={<FaCheck />} shape="circle" onClick={() => onReveal?.()} />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SongAnswer;