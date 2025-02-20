import { useMemo } from "react";
import { RootStoreContext, createRootStore } from "./stores/root.ts";
import { Syncers, SyncersContext } from "./stores/sync.ts";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useMemo(() => createRootStore(), []);
  const syncers = useMemo(() => new Syncers(), []);

  return (
    <SyncersContext.Provider value={syncers}>
      <RootStoreContext.Provider value={rootStore}>
        {children}
      </RootStoreContext.Provider>
    </SyncersContext.Provider>
  );
};
