import { Button, Flex, Input } from "antd";
import type { Playlist } from "../Hooks/useNeonBeatGames";
import { useState } from "react";

function GameCreator({ playlists, onPlaylistSelected }: { playlists?: Playlist[], onPlaylistSelected?: (name: string, playlistId: string) => void }) {
  const [name, setName] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  return <Flex vertical gap="small">
    <Input placeholder="Game Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
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
    <Button
      type="primary"
      disabled={!selectedPlaylistId}
      onClick={() => onPlaylistSelected && onPlaylistSelected(name, selectedPlaylistId)}
    >
      Create Game
    </Button>
  </Flex>;
}

export default GameCreator;
