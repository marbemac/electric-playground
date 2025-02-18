import { useEffect } from "react";

import type { SyncStore } from "~/stores/sync.ts";

export const useSyncIfNotPaused = (syncer: SyncStore, force = false) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!syncer.isPaused || (force && !syncer.isSyncing)) {
			syncer.start();
		}

		return () => syncer.stop();
	}, [force]);
};
