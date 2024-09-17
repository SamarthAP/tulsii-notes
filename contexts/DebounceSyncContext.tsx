import { useDebounceFunction } from "@/hooks/useDebounceFunction";
import { createContext, useContext } from "react";
import { useSession } from "./SessionContext";
import { syncAndHandleErrors } from "@/lib/sync";
import { lg } from "@/utils/noProd";

export interface DebouncedSyncContextInterface {
  debouncedSync: () => void;
}

const DebouncedSyncContext =
  createContext<DebouncedSyncContextInterface | null>(null);

function useDebouncedSync() {
  const context = useContext(DebouncedSyncContext);
  if (!context) {
    throw new Error(
      "useDebouncedSync must be used within a DebouncedSyncProvider"
    );
  }
  return context;
}

function DebouncedSyncProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const debouncedSync = useDebounceFunction(async () => {
    lg("syncing (debounced)");
    await syncAndHandleErrors({ userId: session?.user.id || "" });
  }, 3000);

  return (
    <DebouncedSyncContext.Provider value={{ debouncedSync }}>
      {children}
    </DebouncedSyncContext.Provider>
  );
}

export { useDebouncedSync, DebouncedSyncProvider };
