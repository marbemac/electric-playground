import { useEffect } from "react";

import { useRootStore } from "~/stores/root.ts";
import type { SyncStore } from "~/stores/sync.ts";

export const Syncer = () => {
  const rootStore = useRootStore();

  useSyncIfNotPaused(rootStore.tenants.syncer);
  useSyncIfNotPaused(rootStore.users.syncer);

  return null;
};

const useSyncIfNotPaused = (syncer: SyncStore) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!syncer.isPaused) {
      syncer.start();
    }

    return () => syncer.stop();
  }, []);
};
