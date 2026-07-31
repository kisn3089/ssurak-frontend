import { TableWithExpiresAt, BoardTableContext } from "./BoardTableContext";

type BoardTableProviderProps = {
  table: Partial<TableWithExpiresAt>;
  children: React.ReactNode;
};

export default function BoardTableProvider({
  table,
  children,
}: BoardTableProviderProps) {
  return (
    <BoardTableContext.Provider value={table}>
      {children}
    </BoardTableContext.Provider>
  );
}
