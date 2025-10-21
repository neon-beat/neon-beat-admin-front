import { Flex } from "antd";
import useNeonBeatGame, { type Field } from "../Hooks/useNeonBeatGame";
import SongAnswer from "./SongAnswer";

function SongController() {
  const { song, revealField, pointFieldsFound, bonusFieldsFound } = useNeonBeatGame();

  const handleOnReveal = async (field: Field, kind: string) => {
    await revealField(field, kind);
  };

  if (!song) {
    return <div>No song currently playing</div>;
  }

  return <Flex vertical gap="small" className="grow-1">
    {song.point_fields && song.point_fields.map((field) => <SongAnswer
      key={field.key}
      field={field}
      isRevealed={pointFieldsFound.includes(field.key)}
      onReveal={(field) => handleOnReveal(field, 'point')}
    />)}
    {song.bonus_fields && song.bonus_fields.map((field) => <SongAnswer
      key={field.key}
      field={field}
      isRevealed={bonusFieldsFound.includes(field.key)}
      onReveal={(field) => handleOnReveal(field, 'bonus')}
    />)}
  </Flex>;
}

export default SongController;
