import { Button, Flex } from "antd";
import { FaCheck, FaXmark } from "react-icons/fa6";

function SongAnswer({ label, isRevealed, onReveal, isCorrect }: { label: string; onReveal?: () => void; isRevealed?: boolean; isCorrect?: boolean }) {
  const correctnessIcon = isCorrect === undefined
    ? null
    : isCorrect
      ? <FaCheck color="green" />
      : <FaXmark color="red" />;

  return (
    <Flex vertical gap="small" className={`rounded-full border-1 border-[#424242] !p-1 !pl-3 ${isRevealed ? 'bg-green-800' : ''}`}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="small">
          {correctnessIcon}
          <span>{label}</span>
        </Flex>
        <Flex gap="small">
          <Button size="small" icon={<FaCheck />} shape="circle" onClick={() => onReveal?.()} />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SongAnswer;