import type { MessageInstance } from "antd/es/message/interface";
import { createContext } from "react";

interface MessageContextType {
  messageApi: MessageInstance;
}

const MessageContext = createContext<MessageContextType | null>(null);

export default MessageContext;