import { observer } from "mobx-react-lite";

import type { SyncStore } from "~/stores/sync.ts";

export const SyncButton = observer(({ syncer }: { syncer: SyncStore }) => {
  return (
    <div
      title={syncer.isSyncing ? "Syncing" : "Not syncing"}
      className="cursor-pointer flex items-center gap-2 text-xs"
      onClick={() => syncer.togglePause()}
    >
      <div className="opacity-80">
        {syncer.isSyncing ? "syncing" : "not syncing"}
      </div>

      <div
        className={`h-1.5 w-1.5 rounded-full ${
          syncer.isSyncing ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </div>
  );
});
