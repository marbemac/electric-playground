import { useEffect } from "react";
import {
	type InjectSyncerOptions,
	type SyncableRecord,
	useSyncers,
} from "~/stores/sync.ts";

export const useSyncer = <T extends SyncableRecord<unknown>>(
	opts: InjectSyncerOptions<T>,
) => {
	const syncers = useSyncers();
	const syncer = syncers.injectSyncer(opts);

	useEffect(() => {
		if (!syncer.isEqualToCurrentShapeStreamOptions(opts.shapeStream)) {
			syncer.updateShapeStreamOptions(opts.shapeStream);
		}
	}, [syncer, opts.shapeStream]);

	useEffect(() => {
		syncer.registerObserver();

		if (!syncer.isPaused && !syncer.isSyncing) {
			syncer.start();
		}

		return () => {
			syncer.unregisterObserver();
		};
	}, [syncer]);

	return syncer;
};
