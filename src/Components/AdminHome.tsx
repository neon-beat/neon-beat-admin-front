import { Button, Card, Collapse, Flex, Typography } from "antd";
import ImportPlaylist from "./ImportPlaylist";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import '../css/admin-home.css';
import GameController from "./GameController";
import GameCreator from "./GameCreator";
import { useState } from "react";
import GameItem from "./GameItem";
import SongController from "./SongController";
import TeamsController from "./TeamsController";
import BuzzController from "./BuzzController";

function AdminHome() {
  const { song, game, games, gameState, teams,
    importPlaylist, createGameWithPlaylist,
    showGameList, teamIdBuzzing,
  } = useNeonBeatGame();

  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  const currentTeamBuzzing = teams?.find((team) => team.id === teamIdBuzzing);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeVideoId = song?.url ? getYouTubeVideoId(song.url) : null;

  return (
    <Card
      title="Neon Beat Admin Panel"
      className="nba-admin-home flex flex-col overflow-hidden"
      classNames={{ header: 'text-center', body: 'grow-1 overflow-auto' }}
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
                  <Flex vertical gap="small">
                    <Button type="primary" className="grow-1" onClick={() => setIsCreatingGame(true)}>New game</Button>
                    <ImportPlaylist onImport={importPlaylist} />
                  </Flex>
                </> :
                  <GameCreator
                    onCreateGame={async (payload, shuffle) => {
                      await createGameWithPlaylist(payload, shuffle);
                      setIsCreatingGame(false);
                    }}
                    onCancel={() => setIsCreatingGame(false)}
                  />
                }
              </Flex>
            </>
          )}
          {song?.id && <SongController />}
          {song?.id && youtubeVideoId && (
            <Collapse 
              size="small"
              items={[{
                key: 'youtube-preview',
                label: 'Preview Current Song',
                children: (
                  <div style={{ textAlign: 'center' }}>
                    <iframe
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                )
              }]}
            />
          )}
          {currentTeamBuzzing && <BuzzController team={currentTeamBuzzing} />}
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