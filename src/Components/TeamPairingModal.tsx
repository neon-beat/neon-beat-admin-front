import { useEffect, useState } from "react";
import { Button, Divider, Modal } from "antd";
import type { Team } from "../Hooks/useNeonBeatGame";
import TeamItem from "./TeamItem";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function TeamPairingModal(
  { open, onClose, selectedTeam, onManualPairing, onAutoPairingClick }
    : {
      open: boolean,
      onClose: () => void,
      selectedTeam?: Team,
      onManualPairing?: (team: Team, buzzerId: string) => void,
      onAutoPairingClick?: (team: Team) => void,
    }) {
  const [currentManualPairingTeam, setCurrentManualPairingTeam] = useState<Team | undefined>();

  const { buzzers, teams } = useNeonBeatGame();

  const handleBuzzerClick = (buzzerId: string) => {
    if (currentManualPairingTeam && onManualPairing) {
      onManualPairing(currentManualPairingTeam, buzzerId);
      setCurrentManualPairingTeam(undefined);
    }
  };

  const checkManualPairingEnabled = () => {
    if (!(typeof onManualPairing === 'function')) return false
    if (!buzzers) return false;
    if (buzzers.length === 0) return false;
    return true;
  }

  useEffect(() => {
    setCurrentManualPairingTeam(selectedTeam);
  }, [selectedTeam]);

  return <Modal
    title={`Team/Buzzer Pairing`}
    open={open}
    onCancel={onClose}
    footer={null}
  >
    {(teams && teams.length && teams.length > 0) ? teams.map(team => (
      <TeamItem
        key={team.id}
        team={team}
        onManualPairingClick={checkManualPairingEnabled() ? () => setCurrentManualPairingTeam(team) : undefined}
        onAutoPairingClick={team?.id ? onAutoPairingClick : undefined}
        isSelected={currentManualPairingTeam?.name === team.name}
        showScores={false}
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
