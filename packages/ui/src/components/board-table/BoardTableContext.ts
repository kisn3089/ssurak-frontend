import { createContext, useContext } from "react";

type TableLike = {
  tableNumber: string;
  seats?: number | null;
  section?: string | null;
  floor?: number | null;
};

export type TableWithExpiresAt = TableLike & {
  publicId: string;
  qrCode: string;
  isActive: boolean;
  expiresAt: Date | undefined;
};

export const BoardTableContext =
  createContext<Partial<TableWithExpiresAt> | null>(null);

export function useBoardTableContext(slot: string) {
  const context = useContext(BoardTableContext);
  if (!context) {
    throw new Error(`${slot} must be used within a BoardTableProvider`);
  }
  return context;
}
