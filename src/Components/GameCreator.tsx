import { useContext, useState } from "react";
import { Button, Checkbox, Flex, Input, Typography } from "antd";
import { FaLink, FaPlus } from "react-icons/fa6";
import type { Team } from "../Hooks/useNeonBeatGame";
import type { GamePayload } from "../Context/ApiContext";
import '../css/game-creator.css';
import MessageContext from "../Context/MessageContext";
import TeamItem from "./TeamItem";
import TeamPairingModal from "./TeamPairingModal";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function GameCreator(
  { onCreateGame, onCancel }
    : {
      onCreateGame?: (payload: GamePayload, shuffle: boolean) => void,
      onCancel: () => void,
    }) {
  const [gameName, setGameName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | undefined>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [shufflePlaylist, setShufflePlaylist] = useState<boolean>(false);

  const [buzzerPairingModalOpen, setBuzzerPairingModalOpen] = useState<boolean>(false);

  const { messageApi } = useContext(MessageContext)!;

  const { playlists } = useNeonBeatGame();

  const addTeam = async (name: string) => {
    if (name.trim() === '') return;
    const newTeam: Team = {
      name,
      buzzer_id: undefined,
    };
    setTeamList(prev => [...prev, newTeam]);
    setTeamName('');
  };

  const handleClickCreateGame = async () => {
    if (!gameName) {
      messageApi.error('Please enter a game name.');
      return;
    }
    if (!selectedPlaylistId) {
      messageApi.error('Please select a playlist.');
      return;
    }
    if (teamList.length === 0) {
      messageApi.error('Please add at least one team.');
      return;
    }
    if (onCreateGame) {
      await onCreateGame({
        name: gameName,
        playlist_id: selectedPlaylistId,
        teams: teamList,
      }, shufflePlaylist);
    }
  };

  const handleClickDeleteTeam = (teamToDelete: Team) => {
    setTeamList(prev => prev.filter(team => team !== teamToDelete));
  }

  return <Flex vertical gap="small" className="nba-game-creator">
    <Input placeholder="Game Name" type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} />
    {!selectedPlaylistId && <Typography.Text>Select a Playlist:</Typography.Text>}
    {selectedPlaylistId && (
      <Flex justify="space-between">
      <Typography.Text>Selected Playlist: {playlists?.find((p) => p.id === selectedPlaylistId)?.name}</Typography.Text>
      <Checkbox 
        checked={shufflePlaylist}
        onChange={(e) => setShufflePlaylist(e.target.checked)}
      >
        Shuffle Playlist
      </Checkbox>
    </Flex>
    )}
    <Flex vertical gap="small" className="grow-1">
      {playlists && playlists.length > 0 ? (
        playlists.map((playlist) => (
          <Button
            key={playlist.id}
            className={selectedPlaylistId === playlist.id ? '!border-main-purple !text-main-purple' : ''}
            type="default"
            onClick={() => setSelectedPlaylistId(playlist.id)}
          >
            {playlist.name}
          </Button>
        ))
      ) : (
        <p>No playlists available.</p>
      )}
    </Flex>
    <Typography.Text>Teams</Typography.Text>
    <Flex gap="small">
      <Input placeholder="Team Name" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
      <Button type="default" icon={<FaPlus />} onClick={() => addTeam(teamName)}>Add Team</Button>
      <Button className="min-w-[32px]" type="default" icon={<FaLink />} onClick={() => setBuzzerPairingModalOpen(true)} />
    </Flex>
    {teamList.length > 0 && <Flex vertical gap="small" className="grow-1 overflow-y-auto">
      {teamList.map((team) => <TeamItem
        team={team}
        onDelete={() => handleClickDeleteTeam(team)}
        key={team.id}
      />
      )}
    </Flex>}
    <Button
      type="primary"
      disabled={!selectedPlaylistId}
      onClick={handleClickCreateGame}
    >
      Create Game
    </Button>
    <Button type="default" danger onClick={onCancel}>Cancel</Button>
    <TeamPairingModal
      open={buzzerPairingModalOpen}
      onClose={() => setBuzzerPairingModalOpen(false)}
      teamList={teamList}
    />
  </Flex>;
}

export default GameCreator;
