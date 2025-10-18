import { Button, Card, Flex, Typography } from "antd";
import ImportPlaylist from "./ImportPlaylist";
import useNeonBeatGames from "../Hooks/useNeonBeatGames";
import '../css/admin-home.css';
import GameController from "./GameController";
import SongAnswer from "./SongAnswer";
import GameCreator from "./GameCreator";
import { useState } from "react";
import GameItem from "./GameItem";

function AdminHome() {
  const { game, song, games, teams, playlists, buzzerList,
    importPlaylist, createGameWithPlaylist, currentTeamPairing,
  } = useNeonBeatGames();

  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  return (
    <Card
      title="Neon Beat Admin Panel"
      className="nba-admin-home"
      classNames={{ header: 'text-center' }}
    >
      <Typography.Title level={5}>Current Games</Typography.Title>
      <Flex vertical gap="small">
        {isCreatingGame === false ? <>
          {games && games.length > 0
            ? (
              games.map((g) => <GameItem key={g.id} game={g} teamList={teams} buzzerList={buzzerList} currentTeamPairing={currentTeamPairing} />)
            )
            : <p>No games available. Please add some games to get started.</p>
          }
          <Flex gap="small">
            <Button type="primary" className="grow-1" onClick={() => setIsCreatingGame(true)}>New game</Button>
            <ImportPlaylist onImport={importPlaylist} />
          </Flex>
        </> :
          <GameCreator
            playlists={playlists}
            onCreateGame={createGameWithPlaylist}
            buzzerList={buzzerList}
            onCancel={() => setIsCreatingGame(false)}
          />
        }
        {song?.point_fields?.length && song?.point_fields?.length > 0 && <SongAnswer field="Sample Field" value="Sample Value" />}
        {game?.id && <GameController game={game} />}
      </Flex>
    </Card>
  );
}

export default AdminHome;