import { Button, Flex } from "antd";
import type { Team } from "../Hooks/useNeonBeatGames";
import { CloseOutlined } from "@ant-design/icons";
import { FaHand, FaLink } from "react-icons/fa6";
import '../css/team-item.css';

function TeamItem(
  { team, onManualPairingClick, onAutoPairingClick, onDelete, isSelected }
    : {
      team: Team,
      onManualPairingClick?: () => void,
      onAutoPairingClick?: (team: Team) => void,
      onDelete?: () => void,
      isSelected?: boolean,
    }) {
  return (
    <Flex
      className={`team-item ${isSelected === true ? 'selected' : ''}`}
      justify="space-between"
      align="center"
      gap="small"
      key={team.id}
    >
      <span>{team.name} : {team.buzzer_id ? 'Paired' : 'Not Paired'}</span>
      <Flex gap="small" align="center">
        {onManualPairingClick && <Button
          type="text"
          icon={<FaHand />}
          // onClick={() => {
          //   setCurrentPairingTeam(team);
          //   setBuzzerPairingModalOpen(true);
          // }}
          onClick={onManualPairingClick}
        />}
        {onAutoPairingClick && <Button
          type="text"
          icon={<FaLink />}
          // onClick={() => startPairingTeam(team)}
          onClick={() => onAutoPairingClick(team)}
        />}
        {onDelete && <Button
          type="text"
          icon={<CloseOutlined />}
          // onClick={() => setTeamList(prev => prev.filter(p => p !== team))}
          onClick={onDelete}
        />}
      </Flex>
    </Flex>
  );
}

export default TeamItem;
