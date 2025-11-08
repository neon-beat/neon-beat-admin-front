import { Flex } from "antd";
import TeamItem from "./TeamItem";
import useNeonBeatGame from "../Hooks/useNeonBeatGame";
import { useApiContext } from "../Hooks/useApiContext";

function TeamsController() {
  const { deleteTeam } = useApiContext();
  const { teams, grantTeamPoints, canDeleteTeam } = useNeonBeatGame();
  return (
    <Flex vertical gap="small" className="grow-1">
      {teams && teams.length > 0 && teams.map(team => (
        <TeamItem
          key={team.id}
          team={team}
          onAddPoint={() => grantTeamPoints(team, 1)}
          onRemovePoint={() => grantTeamPoints(team, -1)}
          onDelete={canDeleteTeam() === true && team.id ? () => deleteTeam(team.id!) : undefined}
        />
      ))}
    </Flex>
  );
}

export default TeamsController;
