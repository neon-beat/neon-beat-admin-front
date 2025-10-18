import { useEffect, useState } from "react";
import { Button, Divider, Modal } from "antd";
import type { Team } from "../Hooks/useNeonBeatGames";
import TeamItem from "./TeamItem";

function TeamPairingModal(
  { open, onClose, teamList, selectedTeam, buzzerList, onManualPairing, onAutoPairingClick }
    : {
      open: boolean,
      onClose: () => void,
      teamList?: Team[],
      selectedTeam?: Team,
      buzzerList: { id: string }[],
      onManualPairing?: (team: Team, buzzerId: string) => void,
      onAutoPairingClick?: (team: Team) => void,
    }) {
  const [currentPairingTeam, setCurrentPairingTeam] = useState<Team | undefined>();

  const handleBuzzerClick = (buzzerId: string) => {
    if (currentPairingTeam && onManualPairing) {
      onManualPairing(currentPairingTeam, buzzerId);
      setCurrentPairingTeam(undefined);
    }
  };

  const checkManualPairingEnabled = () => {
    if (!(typeof onManualPairing === 'function')) return false
    if (!buzzerList) return false;
    if (buzzerList.length === 0) return false;
    return true;
  }

  useEffect(() => {
    setCurrentPairingTeam(selectedTeam);
  }, [selectedTeam]);

  return <Modal
    title={`Team/Buzzer Pairing`}
    open={open}
    onCancel={onClose}
    footer={null}
  >
    {(teamList && teamList.length && teamList.length > 0) ? teamList.map(team => (
      <TeamItem
        key={team.id}
        team={team}
        onManualPairingClick={checkManualPairingEnabled() ? () => setCurrentPairingTeam(team) : undefined}
        onAutoPairingClick={team?.id ? onAutoPairingClick : undefined}
        isSelected={currentPairingTeam?.name === team.name}
      />
    ))
      : <p>No teams available for pairing.</p>
    }
    <Divider />
    {(buzzerList && buzzerList.length && buzzerList.length > 0) ? buzzerList.map(buzzer => (
      <Button key={buzzer.id} type="default" onClick={() => handleBuzzerClick(buzzer.id)}>Buzzer {buzzer.id}</Button>
    ))
      : <p>No buzzers available.</p>
    }
  </Modal>;
}

export default TeamPairingModal;
