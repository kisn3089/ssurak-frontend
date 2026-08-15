import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type ActionStatus = "idle" | "loading" | "success" | "error";
export type StatusMetaText = Partial<{
  [key in ActionStatus]: string;
}>;

export interface ActionStatusProps {
  statusMetaText?: StatusMetaText;
}

export interface ActionStatusContextValue extends ActionStatusProps {
  actionStatus: ActionStatus;
  setActionStatus: Dispatch<SetStateAction<ActionStatus>>;
}

export const ActionStatusContext =
  createContext<ActionStatusContextValue | null>(null);

export function useActionStatus() {
  const context = useContext(ActionStatusContext);
  if (!context) {
    throw new Error(
      "useActionStatus must be used within a ActionStatusProvider"
    );
  }
  return context;
}
