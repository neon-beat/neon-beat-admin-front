import { Button, Card, Flex, Typography } from "antd";
import ImportPlaylist from "./ImportPlaylist";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import '../css/admin-home.css';
import GameController from "./GameController";
import GameCreator from "./GameCreator";
import { useState } from "react";
import GameItem from "./GameItem";
import SongController from "./SongController";
import TeamsController from "./TeamsController";

function AdminHome() {
  const { song, game, games, gameState, teams,
    importPlaylist, createGameWithPlaylist,
    showGameList,
  } = useNeonBeatGame();

  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  return (
    <Card
      title="Neon Beat Admin Panel"
      className="nba-admin-home flex flex-col"
      classNames={{ header: 'text-center', body: 'grow-1' }}
    >
      <Flex vertical justify="space-between" gap="large" className="h-full">
        <Flex vertical justify="flex-start" gap="large">
          {import.meta.env.VITE_DEBUG_GAMESTATE && <Typography.Title level={5} className="text-center !w-full">
            Debug Game State: {gameState}
          </Typography.Title>}
          {showGameList() && (
            <>
              <Typography.Title level={5}>Current Games</Typography.Title>
              <Flex vertical gap="small">
                {isCreatingGame === false ? <>
                  {games && games.length > 0
                    ? (
                      games.map((g) => <GameItem key={g.id} game={g} isLoadedGame={g.id === game?.id} />)
                    )
                    : <p>No games available. Please add some games to get started.</p>
                  }
                  <Flex gap="small">
                    <Button type="primary" className="grow-1" onClick={() => setIsCreatingGame(true)}>New game</Button>
                    <ImportPlaylist onImport={importPlaylist} />
                  </Flex>
                </> :
                  <GameCreator
                    onCreateGame={async (payload) => {
                      await createGameWithPlaylist(payload);
                      setIsCreatingGame(false);
                    }}
                    onCancel={() => setIsCreatingGame(false)}
                  />
                }
              </Flex>
            </>
          )}
          {song?.id && <SongController />}

          {teams && teams.length > 0 && <TeamsController />}
          {game?.id && <GameController />}
        </Flex>
        <Flex justify="center">
          by La Factorlette
        </Flex>
      </Flex>
    </Card>
  );
}

export default AdminHome;