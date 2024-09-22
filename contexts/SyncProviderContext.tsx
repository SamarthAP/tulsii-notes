import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";
import { syncAndHandleErrors } from "@/lib/sync";
// import { database } from '@/lib/watermelon';
import { useSession } from "./SessionContext";
// import { useDebounceFunction } from "@/hooks/useDebounceFunction";
import { lg } from "@/utils/noProd";

const SYNC_DELAY = 1000; // 1 second delay for debounce

export const SyncContext = createContext<{
  isSyncing: boolean;
  queueSync: () => void;
}>({
  isSyncing: false,
  queueSync: () => {},
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncQueued, setIsSyncQueued] = useState(false);
  const { session } = useSession();

  // const debouncedSync = useDebounceFunction(async () => {
  //   lg("running debouncedSync");
  //   await syncAndHandleErrors({ userId: session?.user.id || "" });
  //   lg("debouncedSync run finished");
  // }, SYNC_DELAY);

  useEffect(() => {
    queueSync();
  }, [session?.user.id]);

  // On initial load, queue sync and listen for app state changes
  useEffect(() => {
    console.log("Initial sync");
    queueSync();

    const subscription = AppState.addEventListener("change", queueSync);

    return () => {
      subscription.remove();
    };
  }, []);

  // Listen for db changes
  // useEffect(() => {
  //   const subscription = database
  //     .withChangesForTables(['notes'])
  //     .subscribe({
  //       next: (changes) => {
  //         const changedRecords = changes?.filter(
  //           (c) => c.record.syncStatus !== 'synced'
  //         );

  //         if (changedRecords?.length) {
  //           console.log('Database changes detected', changedRecords.length);
  //           debouncedSync();
  //         }
  //       },
  //       error: (error) => console.error('Database changes error', error),
  //     });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, [database]);

  function queueSync() {
    setIsSyncQueued(true);
  }

  // If not syncing but sync is queued, execute sync
  useEffect(() => {
    if (!isSyncing && isSyncQueued) {
      executeSync();
    }
  }, [isSyncing, isSyncQueued]);

  async function executeSync() {
    setIsSyncQueued(false);
    setIsSyncing(true);

    try {
      await syncAndHandleErrors({ userId: session?.user.id || "" });
    } catch (error) {
      lg("Sync failed", { error });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        queueSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
