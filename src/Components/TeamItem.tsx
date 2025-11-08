import { Button, Flex } from "antd";
import type { Team } from "../Hooks/useNeonBeatGame";
import { FaHand, FaHourglassHalf, FaLink, FaMinus, FaPlus, FaXmark } from "react-icons/fa6";
import '../css/team-item.css';
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function TeamItem(
  { team, onManualPairingClick, onAutoPairingClick, onDelete, onAddPoint, onRemovePoint, isSelected, showScores = true }
    : {
      team: Team,
      onManualPairingClick?: () => void,
      onAutoPairingClick?: (team: Team) => void,
      onDelete?: () => void,
      onAddPoint?: () => void,
      onRemovePoint?: () => void,
      isSelected?: boolean,
      showScores?: boolean,
    }) {
  const { canPairTeams, currentTeamPairing } = useNeonBeatGame();
  return (
    <Flex
      className={`team-item ${isSelected === true ? 'selected' : ''}`}
      justify="space-between"
      align="center"
      gap="small"
      key={team.id}
    >
      <Flex align="center" gap="small">
        {team.buzzer_id ? <FaLink color="green" /> : ''}
        <span>{team.name}{(showScores === true && typeof team.score !== 'undefined') ? `: ${team.score} point${team.score === 1 ? '' : 's'}` : ''}</span>
      </Flex>
      <Flex gap="small" align="center">
        {onManualPairingClick && <Button
          type="text"
          icon={<FaHand />}
          onClick={onManualPairingClick}
        />}
        {onAutoPairingClick && <Button
          type="text"
          icon={currentTeamPairing?.id === team.id ? <FaHourglassHalf /> : <FaLink />}
          onClick={() => onAutoPairingClick(team)}
          disabled={!canPairTeams()}
        />}
        <div className="divider-vertical" />
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
        <div className="divider-vertical" />
        {onDelete && <Button
          type="text"
          icon={<FaXmark color="red" />}
          onClick={onDelete}
        />}
      </Flex>
    </Flex>
  );
}

export default TeamItem;
