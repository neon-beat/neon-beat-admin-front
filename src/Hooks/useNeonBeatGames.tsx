import { useContext, useEffect, useState } from "react";
import MessageContext from "../Context/MessageContext";
import { useApiContext } from "./useApiContext";
import type { GamePayload } from "../Context/ApiContext";

export interface Field {
  key: string;
  points: number;
  value: string;
}
export interface Song {
  id: string;
  bonus_fields: Field[];
  guess_duration_ms: number;
  point_fields: Field[];
  starts_at_ms: number;
  url: string;
}

export interface Game {
  id: string;
  name: string;
  playlist: Playlist;
  players?: Team[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Add other game properties as needed
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  // Add other playlist properties as needed
}

export interface Team {
  id?: string;
  buzzer_id?: string;
  name: string;
  score?: number;
}

export interface Buzzer {
  id: string;
}

const useNeonBeatGames = () => {
  const messageContext = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('useNeonBeatGames must be used within a MessageContext.Provider');
  }
  const { messageApi } = messageContext;

  const { sse, getGames, postGame, getPlaylists, postPlaylist, getTeams, postTeam, isServerReady } = useApiContext();

  const [games, setGames] = useState<Game[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamPairing, setCurrentTeamPairing] = useState<Team | undefined>();

  const [game, setGame] = useState<Game | undefined>();
  const [song, /*setSong*/] = useState<Song | undefined>();

  const [buzzerList] = useState<Buzzer[]>([]);

  const loadTeams = async () => {
    getTeams()
      .then((data) => {
        setTeams(data);
      })
      .catch((error) => {
        messageApi.error(`Error fetching teams: ${error.message}`);
      });
  };

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

  const createGameWithPlaylist = async (payload: GamePayload) => {
    const newGame = await postGame(payload);
    setGame(newGame);
    messageApi.success('Game created successfully');
    loadGames();
  };

  const createTeamWithoutBuzzer = async (name: string) => {
    const payload = {
      name,
      score: 0,
    };

    await postTeam(payload);
    await loadTeams();
    messageApi.success('Team created successfully');
  };

  const onPairingAssigned = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { team_id, buzzer_id } = data;
    messageApi.success(`Team ${teams.find((t) => t.id === team_id)?.id} paired with Buzzer ${buzzer_id}`);
    loadTeams();
    setCurrentTeamPairing(undefined);
  };

  useEffect(() => {
    if (isServerReady) {
      loadGames();
      loadPlaylists();
    }
  }, [isServerReady]);

  useEffect(() => {
    loadTeams();
  }, [game]);

  useEffect(() => {
    if (!sse) return;

    sse.addEventListener('pairing.assigned', onPairingAssigned);

    return () => {
      sse.removeEventListener('pairing.assigned', onPairingAssigned);
    };
  }, [sse]);

  return {
    games,
    playlists,
    createGameWithPlaylist,
    importPlaylist,
    createTeamWithoutBuzzer,
    currentTeamPairing,
    game,
    teams,
    song,
    buzzerList,
  };
};

export default useNeonBeatGames;
