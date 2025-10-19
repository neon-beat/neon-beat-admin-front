import { useEffect, useState } from "react";
import { Button, Divider, Modal } from "antd";
import type { Team } from "../Hooks/useNeonBeatGame";
import TeamItem from "./TeamItem";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function TeamPairingModal(
  { open, onClose, teamList, selectedTeam, onManualPairing, onAutoPairingClick }
    : {
      open: boolean,
      onClose: () => void,
      teamList?: Team[],
      selectedTeam?: Team,
      onManualPairing?: (team: Team, buzzerId: string) => void,
      onAutoPairingClick?: (team: Team) => void,
    }) {
  const [currentPairingTeam, setCurrentPairingTeam] = useState<Team | undefined>();

  const { buzzers } = useNeonBeatGame();

  const handleBuzzerClick = (buzzerId: string) => {
    if (currentPairingTeam && onManualPairing) {
      onManualPairing(currentPairingTeam, buzzerId);
      setCurrentPairingTeam(undefined);
    }
  };

  const checkManualPairingEnabled = () => {
    if (!(typeof onManualPairing === 'function')) return false
    if (!buzzers) return false;
    if (buzzers.length === 0) return false;
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
    {(buzzers && buzzers.length && buzzers.length > 0) ? buzzers.map(buzzer => (
      <Button key={buzzer.id} type="default" onClick={() => handleBuzzerClick(buzzer.id)}>Buzzer {buzzer.id}</Button>
    ))
      : <p>No buzzers available.</p>
    }
  </Modal>;
}

export default TeamPairingModal;
