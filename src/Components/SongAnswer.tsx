import { Button, Flex } from "antd";
import { FaCheck, FaEye } from "react-icons/fa6";

function SongAnswer({ field, value }: { field: string; value: string }) {
  return (
    <Flex vertical gap="small" className="rounded-lg border-1 border-white bg-emerald-400 !p-1">
      <Flex justify="space-between" align="center">
        <span>{field}: <b>{value}</b></span>
        <Flex gap="small">
          <Button size="small" icon={<FaEye />} />
          <Button size="small" icon={<FaCheck />} />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SongAnswer;