import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

import { useRootStore } from "~/stores/root";
import type { SyncStore } from "~/stores/sync";
import type { TenantStore } from "~/stores/tenants";
import type { UserStore } from "~/stores/users";

import type { InvoiceStore } from "~/stores/invoices.ts";
import type { SubscriptionStore } from "~/stores/subscriptions.ts";
import { useSyncIfNotPaused } from "~/utils/use-sync-if-not-paused.ts";
import { SyncButton } from "./-components/SyncButton.tsx";
import { changeInvoiceTotal, removeInvoice } from "./-server/invoices.ts";
import { removeUser } from "./-server/users.ts";

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
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-full">
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

          <SyncButton syncer={syncer} />
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
    return <div className="text-gray-400 p-4">No users found</div>;
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await removeUser({ data: { userId: user.id } });
  }, [user]);

  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-8">
      <div>{user.username}</div>

      <div>({user.tenant?.name ?? `tenant ${user.tenant_id} not found`})</div>

      <button
        type="button"
        className="text-red-400/70 ml-auto text-xs cursor-pointer disabled:opacity-50"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        [X]
      </button>
    </div>
  );
});

const TenantsContent = observer(() => {
  const tenantsStore = useRootStore().tenants;
  const tenants = Object.values(tenantsStore.records);

  if (tenants.length === 0) {
    return <div className="text-gray-400 p-4">No tenants found</div>;
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
  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-8">
      <div>{tenant.name}</div>
      <div>({tenant.userCount} users)</div>
      <div>({tenant.subscription?.totalInvoiced ?? "!!"} total invoiced)</div>
    </div>
  );
});

const SubscriptionsContent = observer(() => {
  const subscriptionsStore = useRootStore().subscriptions;
  const subscriptions = Object.values(subscriptionsStore.records);

  if (subscriptions.length === 0) {
    return <div className="text-gray-400 p-4">No subscriptions found</div>;
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
      <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-8">
        <div>
          (
          {subscription.tenant?.name ??
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
    return <div className="text-gray-400 p-4">No invoices found</div>;
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await removeInvoice({ data: { invoiceId: invoice.id } });
  }, [invoice]);

  const [isChangingTotal, setIsChangingTotal] = useState(false);
  const handleChangeTotal = useCallback(
    async ({ total }: { total: number }) => {
      setIsChangingTotal(true);
      await changeInvoiceTotal({ data: { invoiceId: invoice.id, total } });
      setIsChangingTotal(false);
    },
    [invoice]
  );

  return (
    <div className="even:bg-gray-300/5 px-4 py-1 text-gray-400 text-sm flex gap-8">
      <div>
        (
        {invoice.subscription?.tenant?.name ??
          `tenant ${invoice.subscription?.tenant_id} not found`}
        )
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="text-blue-400/70 ml-auto text-xs cursor-pointer disabled:opacity-50"
          onClick={() => handleChangeTotal({ total: invoice.total - 1 })}
          disabled={isChangingTotal}
        >
          [-]
        </button>
        <div>{invoice.total}</div>
        <button
          type="button"
          className="text-blue-400/70 ml-auto text-xs cursor-pointer disabled:opacity-50"
          onClick={() => handleChangeTotal({ total: invoice.total + 1 })}
          disabled={isChangingTotal}
        >
          [+]
        </button>
      </div>

      <div>{invoice.created_at}</div>

      <button
        type="button"
        className="text-red-400/70 ml-auto text-xs cursor-pointer disabled:opacity-50"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        [X]
      </button>
    </div>
  );
});
