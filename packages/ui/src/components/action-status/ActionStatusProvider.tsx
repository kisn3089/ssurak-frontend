import { useState } from "react";
import {
  ActionStatusContext,
  ActionStatusProps,
  type ActionStatus,
  type ActionStatusContextValue,
} from "./ActionStatusContext";

type ActionStatusProviderProps = {
  children: React.ReactNode;
} & ActionStatusProps;

export default function ActionStatusProvider({
  children,
  statusMetaText,
}: ActionStatusProviderProps) {
  const [actionStatus, setActionStatus] = useState<ActionStatus>("idle");

  const value: ActionStatusContextValue = {
    actionStatus,
    statusMetaText,
    setActionStatus,
  };

  return (
    <ActionStatusContext.Provider value={value}>
      {children}
    </ActionStatusContext.Provider>
  );
}
