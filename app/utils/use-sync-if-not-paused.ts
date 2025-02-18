import { useEffect } from "react";

import type { SyncStore } from "~/stores/sync.ts";

export const useSyncIfNotPaused = (syncer: SyncStore) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!syncer.isPaused) {
			syncer.start();
		}

		return () => syncer.stop();
	}, []);
};
