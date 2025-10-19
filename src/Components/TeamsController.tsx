import { Flex } from "antd";
import TeamItem from "./TeamItem";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";

function TeamsController() {
  const { teams, grantTeamPoints } = useNeonBeatGame();
  return (
    <Flex vertical gap="small" className="grow-1">
      {teams && teams.length > 0 && teams.map(team => (
        <TeamItem key={team.id} team={team} onAddPoint={() => grantTeamPoints(team, 1)} onRemovePoint={() => grantTeamPoints(team, -1)} />
      ))}
    </Flex>
  );
}

export default TeamsController;
