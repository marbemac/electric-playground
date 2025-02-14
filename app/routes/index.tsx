import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useRootStore } from "~/stores/root";
import type { SyncStore } from "~/stores/sync";
import type { TenantStore } from "~/stores/tenants";
import type { UserStore } from "~/stores/users";

import { useEffect } from "react";
import type { InvoiceStore } from "~/stores/invoices";
import type { SubscriptionStore } from "~/stores/subscriptions";

export const Route = createFileRoute("/")({
  component: HomeRoute,
  wrapInSuspense: false,
});

function HomeRoute() {
  const rootStore = useRootStore();
  const usersStore = rootStore.users;
  const tenantsStore = rootStore.tenants;
  const subscriptionsStore = rootStore.subscriptions;
  const invoicesStore = rootStore.invoices;

  useSyncIfNotPaused(rootStore.tenants.syncer);
  useSyncIfNotPaused(rootStore.users.syncer);
  useSyncIfNotPaused(rootStore.subscriptions.syncer);
  useSyncIfNotPaused(rootStore.invoices.syncer);

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen">
      <TableSection
        syncer={tenantsStore.syncer}
        className="border-b-2 border-r-2"
      >
        <TenantsContent />
      </TableSection>

      <TableSection syncer={usersStore.syncer} className="border-b-2">
        <UsersContent />
      </TableSection>

      <TableSection syncer={subscriptionsStore.syncer} className="border-r-2">
        <SubscriptionsContent />
      </TableSection>

      <TableSection syncer={invoicesStore.syncer}>
        <InvoicesContent />
      </TableSection>
    </div>
  );
}

const useSyncIfNotPaused = (syncer: SyncStore) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!syncer.isPaused) {
      syncer.start();
    }

    return () => syncer.stop();
  }, []);
};

const TableSection = observer(
  ({
    syncer,
    children,
    className,
  }: {
    syncer: SyncStore;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={`flex flex-col overflow-hidden ${className}`}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-2 border-b">
          <h2 className="font-semibold">{syncer.table}</h2>

          {syncer && (
            <div
              title={syncer.isSyncing ? "Syncing" : "Not syncing"}
              className="cursor-pointer flex items-center gap-2"
              onClick={() => syncer.togglePause()}
            >
              <div>{syncer.isSyncing ? "Syncing" : "Not syncing"}</div>
              <div
                className={`h-2 w-2 rounded-full ${
                  syncer.isSyncing ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }
);

const UsersContent = observer(() => {
  const usersStore = useRootStore().users;
  const users = Object.values(usersStore.records);

  if (users.length === 0) {
    return <div className="text-gray-400">No users found</div>;
  }

  return (
    <div className="flex flex-col">
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
});

const UserRow = observer(({ user }: { user: UserStore }) => {
  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-5">
      <div>{user.username}</div>
      <div>
        (
        {user.tenant?.maybeCurrent?.name ??
          `tenant ${user.tenant_id} not found`}
        )
      </div>
    </div>
  );
});

const TenantsContent = observer(() => {
  const tenantsStore = useRootStore().tenants;
  const tenants = Object.values(tenantsStore.records);

  if (tenants.length === 0) {
    return <div className="text-gray-400">No tenants found</div>;
  }

  return (
    <div className="flex flex-col">
      {tenants.map((tenant) => (
        <TenantRow key={tenant.id} tenant={tenant} />
      ))}
    </div>
  );
});

const TenantRow = observer(({ tenant }: { tenant: TenantStore }) => {
  console.log(Array.from(tenant.users));
  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-5">
      <div>{tenant.name}</div>
      <div>({tenant.users.size} users)</div>
    </div>
  );
});

const SubscriptionsContent = observer(() => {
  const subscriptionsStore = useRootStore().subscriptions;
  const subscriptions = Object.values(subscriptionsStore.records);

  if (subscriptions.length === 0) {
    return <div className="text-gray-400">No subscriptions found</div>;
  }

  return (
    <div className="flex flex-col">
      {subscriptions.map((subscription) => (
        <SubscriptionRow key={subscription.id} subscription={subscription} />
      ))}
    </div>
  );
});

const SubscriptionRow = observer(
  ({ subscription }: { subscription: SubscriptionStore }) => {
    return (
      <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-5">
        <div>
          (
          {subscription.tenant?.maybeCurrent?.name ??
            `tenant ${subscription.tenant_id} not found`}
          )
        </div>
        <div>{subscription.status}</div>
        <div>{subscription.started_at}</div>
      </div>
    );
  }
);

const InvoicesContent = observer(() => {
  const invoicesStore = useRootStore().invoices;
  const invoices = Object.values(invoicesStore.records);

  if (invoices.length === 0) {
    return <div className="text-gray-400">No invoices found</div>;
  }

  return (
    <div className="flex flex-col">
      {invoices.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
});

const InvoiceRow = observer(({ invoice }: { invoice: InvoiceStore }) => {
  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-5">
      <div>
        (
        {invoice.subscription?.maybeCurrent?.tenant?.maybeCurrent?.name ??
          `tenant ${invoice.subscription?.maybeCurrent?.tenant_id} not found`}
        )
      </div>
      <div>{invoice.total}</div>
      <div>{invoice.created_at}</div>
    </div>
  );
});
