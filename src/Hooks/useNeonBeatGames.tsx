import { useContext, useEffect, useState } from "react";
import MessageContext from "../Context/MessageContext";
import { useApiContext } from "./useApiContext";

export interface BonusField {
  key: string;
  points: number;
  value: string;
}

export interface PointField {
  key: string;
  points: number;
  value: string;
}

export interface Song {
  bonus_fields: BonusField[];
  guess_duration_ms: number;
  point_fields: PointField[];
  starts_at_ms: number;
  url: string;
}

export interface Game {
  id: string;
  name: string;
  status?: string;
  // Add other game properties as needed
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  // Add other playlist properties as needed
}

export interface Player {
  buzzer_id: string;
  name: string;
}

const useNeonBeatGames = () => {
  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('useNeonBeatGames must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const { getGames, postGame, getPlaylists, postPlaylist, isServerReady } = useApiContext();

  const [games, setGames] = useState<Game[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [players] = useState<Player[]>([]);

  const [game, /*setGame*/] = useState<Game>({ id: '', name: '', status: 'paused' });

  const loadGames = async () => {
    getGames()
      .then((data) => {
        setGames(data);
      })
      .catch((error) => {
        messageApi.error(`Error fetching games: ${error.message}`);
      });
  };

  const loadPlaylists = async () => {
    getPlaylists()
      .then((data) => {
        setPlaylists(data);
      })
      .catch((error) => {
        messageApi.error(`Error fetching playlists: ${error.message}`);
      });
  };

  const importPlaylist = async (payload: Playlist) => {
    await postPlaylist(payload);
    messageApi.success('Playlist imported successfully');
    loadPlaylists();
  };

  const createGameWithPlaylist = async (name: string, playlistId: string) => {
    const payload = {
      name,
      players,
      playlist_id: playlistId
    };

    await postGame(payload);
    messageApi.success('Game created successfully');
    loadGames();
  };

  useEffect(() => {
    if (isServerReady) {
      loadGames();
      loadPlaylists();
    }
  }, [isServerReady]);

  return {
    games,
    playlists,
    createGameWithPlaylist,
    importPlaylist,
    game,
  };
};

export default useNeonBeatGames;
