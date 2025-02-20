import { faBook, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

import { useDocumentsSyncer } from "~/hooks/use-documents-syncer.ts";
import { useInvoicesSyncer } from "~/hooks/use-invoices-syncer.ts";
import { useSubscriptionsSyncer } from "~/hooks/use-subscriptions-syncer.ts";
import { useTenantsSyncer } from "~/hooks/use-tenants-syncer.ts";
import { useUserTenantsSyncer } from "~/hooks/use-user-tenants-syncer.ts";
import { useUsersSyncer } from "~/hooks/use-users-syncer.ts";
import { useRootStore } from "~/stores/root";
import { SyncButton } from "./SyncButton.tsx";

export const Gutter = observer(() => {
  const rootStore = useRootStore();
  const currentUser = rootStore.currentUser;

  return (
    <div className="w-48 flex flex-col gap-5 px-3 py-3 text-sm text-gray-300 border-r h-screen">
      <NavigationSection />
      <div className="h-px bg-gray-800" />
      <CurrentUserSection />
      {currentUser && (
        <>
          <div className="h-px bg-gray-800" />
          <CurrentUserTenants />
        </>
      )}
      <div className="h-px bg-gray-800" />
      <SyncControlsSection />
    </div>
  );
});

const NavigationSection = () => {
  const linkClass =
    "px-3 py-2 rounded hover:bg-gray-800/50 data-[status=active]:bg-gray-800/50 flex items-center gap-2";

  return (
    <div className="flex flex-col gap-1">
      <Link to="/" className={linkClass}>
        <FontAwesomeIcon icon={faHome} />
        <span>Home</span>
      </Link>

      <Link to="/documents" className={linkClass}>
        <FontAwesomeIcon icon={faBook} />
        <span>Documents</span>
      </Link>
    </div>
  );
};

const CurrentUserSection = observer(() => {
  const rootStore = useRootStore();

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs uppercase opacity-50 font-medium px-1">
        Logged In As
      </div>

      <div>
        <select
          className="bg-gray-800/50 text-gray-300 rounded px-1 py-1.5 text-xs w-full cursor-pointer"
          value={rootStore.currentUserId || ""}
          onChange={(e) => rootStore.setCurrentUserId(e.target.value || null)}
        >
          <option value="">Anonymous</option>
          {Object.values(rootStore.users.records).map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

const CurrentUserTenants = observer(() => {
  const rootStore = useRootStore();
  const currentUser = rootStore.currentUser;

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs uppercase opacity-50 font-medium px-1">
        My Tenants
      </div>

      <div className="flex flex-col gap-1 px-1">
        {currentUser.tenants.map((tenant) => (
          <div key={tenant.id} className="text-sm flex items-center gap-2">
            <span className="opacity-80 text-xs">{tenant.name}</span>
            <span className="text-xs text-gray-500">
              ({currentUser.isAdminOfTenant(tenant.id) ? "admin" : "member"})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const SyncControlsSection = observer(() => {
  const rootStore = useRootStore();

  const usersSyncer = useUsersSyncer();
  const tenantsSyncer = useTenantsSyncer();
  const userTenantsSyncer = useUserTenantsSyncer();
  const subscriptionsSyncer = useSubscriptionsSyncer();
  const invoicesSyncer = useInvoicesSyncer();
  const documentsSyncer = useDocumentsSyncer({
    userId: rootStore.currentUserId ?? undefined,
  });

  return (
    <div className="flex flex-col gap-3 px-1">
      <div className="text-xs uppercase opacity-50 font-medium">
        Sync Controls
      </div>

      <div>
        <SyncButton label="Users" syncer={usersSyncer} iconOnly fullWidth />

        <SyncButton label="Tenants" syncer={tenantsSyncer} iconOnly fullWidth />

        <SyncButton
          label="User Tenants"
          syncer={userTenantsSyncer}
          iconOnly
          fullWidth
        />

        <SyncButton
          label="Subscriptions"
          syncer={subscriptionsSyncer}
          iconOnly
          fullWidth
        />

        <SyncButton
          label="Invoices"
          syncer={invoicesSyncer}
          iconOnly
          fullWidth
        />

        <SyncButton
          label="Documents"
          syncer={documentsSyncer}
          iconOnly
          fullWidth
        />
      </div>
    </div>
  );
});
