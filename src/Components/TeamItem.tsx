import { Button, Flex } from "antd";
import type { Team } from "../Hooks/useNeonBeatGame";
import { CloseOutlined } from "@ant-design/icons";
import { FaHand, FaLink, FaMinus, FaPlus } from "react-icons/fa6";
import '../css/team-item.css';
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function TeamItem(
  { team, onManualPairingClick, onAutoPairingClick, onDelete, onAddPoint, onRemovePoint, isSelected }
    : {
      team: Team,
      onManualPairingClick?: () => void,
      onAutoPairingClick?: (team: Team) => void,
      onDelete?: () => void,
      onAddPoint?: () => void,
      onRemovePoint?: () => void,
      isSelected?: boolean,
    }) {
  const { canPairTeams } = useNeonBeatGame();
  return (
    <Flex
      className={`team-item ${isSelected === true ? 'selected' : ''}`}
      justify="space-between"
      align="center"
      gap="small"
      key={team.id}
    >
      <Flex align="center" gap="small">
        {team.buzzer_id ? <FaLink /> : ''}
        <span>{team.name}: {typeof team.score !== 'undefined' ? `${team.score} point${team.score === 1 ? '' : 's'}` : ''}</span>
      </Flex>
      <Flex gap="small" align="center">
        {onManualPairingClick && <Button
          type="text"
          icon={<FaHand />}
          onClick={onManualPairingClick}
        />}
        {onAutoPairingClick && <Button
          type="text"
          icon={<FaLink />}
          onClick={() => onAutoPairingClick(team)}
          disabled={!canPairTeams()}
        />}
        {onRemovePoint && <Button
          type="text"
          icon={<FaMinus />}
          onClick={onRemovePoint}
        />}
        {onAddPoint && <Button
          type="text"
          icon={<FaPlus />}
          onClick={onAddPoint}
        />}
        {onDelete && <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onDelete}
        />}
      </Flex>
    </Flex>
  );
}

export default TeamItem;
