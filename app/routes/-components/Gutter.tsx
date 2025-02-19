import { faBook, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

import { useRootStore } from "~/stores/root";
import { useSyncIfNotPaused } from "~/utils/use-sync-if-not-paused.ts";
import { SyncButton } from "./SyncButton.tsx";

export const Gutter = observer(() => {
  const rootStore = useRootStore();
  const linkClass =
    "px-3 py-2 rounded hover:bg-gray-800/50 data-[status=active]:bg-gray-800/50 flex items-center gap-2";

  return (
    <div className="w-48 flex flex-col gap-5 px-3 py-3 text-sm text-gray-300 border-r divide-y h-screen">
      {/* Navigation Section */}
      <div className="flex flex-col gap-1 pb-4">
        <Link to="/" className={linkClass}>
          <FontAwesomeIcon icon={faHome} />
          <span>Home</span>
        </Link>

        <Link to="/documents" className={linkClass}>
          <FontAwesomeIcon icon={faBook} />
          <span>Documents</span>
        </Link>
      </div>

      {/* Sync Controls Section */}
      <div className="flex flex-col gap-3 px-2">
        <div className="text-xs uppercase opacity-50 font-medium">
          Sync Controls
        </div>

        <div>
          <SyncButton
            label="Users"
            syncer={rootStore.users.syncer}
            iconOnly
            fullWidth
          />

          <SyncButton
            label="Tenants"
            syncer={rootStore.tenants.syncer}
            iconOnly
            fullWidth
          />

          <SyncButton
            label="User Tenants"
            syncer={rootStore.userTenants.syncer}
            iconOnly
            fullWidth
          />

          <SyncButton
            label="Subscriptions"
            syncer={rootStore.subscriptions.syncer}
            iconOnly
            fullWidth
          />

          <SyncButton
            label="Invoices"
            syncer={rootStore.invoices.syncer}
            iconOnly
            fullWidth
          />

          <SyncButton
            label="Documents"
            syncer={rootStore.documents.syncer}
            iconOnly
            fullWidth
          />
        </div>
      </div>

      <StartSync />
    </div>
  );
});

const StartSync = () => {
  const rootStore = useRootStore();

  useSyncIfNotPaused(rootStore.tenants.syncer);
  useSyncIfNotPaused(rootStore.users.syncer);
  useSyncIfNotPaused(rootStore.userTenants.syncer);
  useSyncIfNotPaused(rootStore.subscriptions.syncer);
  useSyncIfNotPaused(rootStore.invoices.syncer);
  useSyncIfNotPaused(rootStore.documents.syncer);

  return null;
};
