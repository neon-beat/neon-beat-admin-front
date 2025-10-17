import { Button, Card, Flex, List } from "antd";
import ImportPlaylist from "./ImportPlaylist";
import useNeonBeatGames, { type Game } from "../Hooks/useNeonBeatGames";
import './AdminHome.css';

function AdminHome() {
  const { games, importPlaylist } = useNeonBeatGames();

  return (
    <Card
      title="Welcome to the Admin Panel"
      className="nba-admin-home"
    >
      <Flex vertical gap="small">
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
          <Button type="primary" className="grow-1">New game</Button>
          <ImportPlaylist onImport={importPlaylist} />
        </Flex>
      </Flex>
    </Card>
  );
}

export default AdminHome;