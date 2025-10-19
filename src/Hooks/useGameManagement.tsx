import { useContext } from "react";
import GameManagementContext from "../Context/GameManagementContext";

export const useGameManagement = () => {
  const context = useContext(GameManagementContext);
  if (!context) {
    throw new Error('useGameManagement must be used within a GameManagementProvider');
  }
  return context;
};