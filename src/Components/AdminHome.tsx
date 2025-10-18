import { Button, Card, Flex, List } from "antd";
import ImportPlaylist from "./ImportPlaylist";
import useNeonBeatGames, { type Game } from "../Hooks/useNeonBeatGames";
import '../css/admin-home.css';
import GameController from "./GameController";
import SongAnswer from "./SongAnswer";
import GameCreator from "./GameCreator";
import { useState } from "react";

function AdminHome() {
  const { game, games, playlists,
    importPlaylist, createGameWithPlaylist,
  } = useNeonBeatGames();

  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  return (
    <Card
      title="Welcome to the Admin Panel"
      className="nba-admin-home"
      classNames={{ body: 'h-' }}
    >
      <Flex vertical gap="small">
        {isCreatingGame === false ? <>
          {games && games.length > 0
            ? (
              <List>
                {games.map((game: Game) => (
                  <List.Item key={game.id}>
                    <List.Item.Meta
                      title={game.name}
                      description={`ID: ${game.id} | Status: ${game.status}`}
                    />
                  </List.Item>
                ))}
              </List>
            )
            : <p>No games available. Please add some games to get started.</p>
          }
          <Flex gap="small">
            <Button type="primary" className="grow-1" onClick={() => setIsCreatingGame(true)}>New game</Button>
            <ImportPlaylist onImport={importPlaylist} />
          </Flex>
        </> :
          <GameCreator playlists={playlists} onPlaylistSelected={createGameWithPlaylist} />
        }
        <SongAnswer field="Sample Field" value="Sample Value" />
        <GameController game={game} />
      </Flex>
    </Card>
  );
}

export default AdminHome;