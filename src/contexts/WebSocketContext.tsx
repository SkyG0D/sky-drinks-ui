import { createContext, useState } from "react";

type WebSocketContextProps = {
  updateRequests: boolean;
  updateRequest: boolean;
  setUpdateRequests: (updateRequests: boolean) => void;
  setUpdateRequest: (updateRequest: boolean) => void;
};

type WebSocketProviderProps = {
  children: React.ReactNode;
};

export const WebSocketContext = createContext<WebSocketContextProps>(
  {} as WebSocketContextProps
);

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [updateRequests, setUpdateRequests] = useState(false);
  const [updateRequest, setUpdateRequest] = useState(false);

  return (
    <WebSocketContext.Provider
      value={{
        updateRequests,
        setUpdateRequests,
        updateRequest,
        setUpdateRequest,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
