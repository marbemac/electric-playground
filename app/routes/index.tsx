import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import { useRootStore } from "~/stores/root";
import type { TenantStore } from "~/stores/tenants";
import type { UserStore } from "~/stores/users";

import type { InvoiceStore } from "~/stores/invoices.ts";
import type { SubscriptionStore } from "~/stores/subscriptions.ts";
import { changeInvoiceTotal, removeInvoice } from "./-server/invoices.ts";
import { removeUser } from "./-server/users.ts";

export const Route = createFileRoute("/")({
  ssr: false,
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-full">
      <TableSection title="Tenants" className="border-b-2 border-r-2">
        <TenantsContent />
      </TableSection>

      <TableSection title="Users" className="border-b-2">
        <UsersContent />
      </TableSection>

      <TableSection title="Subscriptions" className="border-r-2">
        <SubscriptionsContent />
      </TableSection>

      <TableSection title="Invoices">
        <InvoicesContent />
      </TableSection>
    </div>
  );
}

const TableSection = observer(
  ({
    title,
    children,
    className,
  }: {
    title: String;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={`flex flex-col overflow-hidden ${className}`}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-2 border-b">
          <h2 className="font-semibold">{title}</h2>
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
      <div className="w-36 truncate">{user.username}</div>

      <div className="flex flex-col gap-1">
        {user.tenants.map((tenant) => (
          <div key={tenant.id} className="flex gap-2">
            <span>{tenant.name}</span>
            <span className="text-xs">
              ({user.isAdminOfTenant(tenant.id) ? "admin" : "member"})
            </span>
          </div>
        ))}
      </div>

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
      <div className="w-44 truncate">{tenant.name}</div>
      <div className="w-40 truncate">
        ({tenant.adminUsers.length} admins, {tenant.memberUsers.length} members)
      </div>
      <div className="shrink-0">
        (${tenant.subscription?.totalInvoiced ?? "!!"} invoiced)
      </div>
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
        <div className="w-44 truncate">
          (
          {subscription.tenant?.name ??
            `tenant ${subscription.tenant_id} not found`}
          )
        </div>
        <div className="w-16">{subscription.status}</div>
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
      <div className="w-52 truncate">
        (
        {invoice.subscription?.tenant?.name ??
          `tenant ${invoice.subscription?.tenant_id} not found`}
        )
      </div>

      <div className="flex gap-2 w-20 justify-between shrink-0">
        <button
          type="button"
          className="text-blue-400/70 text-xs cursor-pointer disabled:opacity-50"
          onClick={() => handleChangeTotal({ total: invoice.total - 1 })}
          disabled={isChangingTotal}
        >
          [-]
        </button>
        <div>{invoice.total}</div>
        <button
          type="button"
          className="text-blue-400/70 text-xs cursor-pointer disabled:opacity-50"
          onClick={() => handleChangeTotal({ total: invoice.total + 1 })}
          disabled={isChangingTotal}
        >
          [+]
        </button>
      </div>

      <div className="truncate">{invoice.created_at}</div>

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
