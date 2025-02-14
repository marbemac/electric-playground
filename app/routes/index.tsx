import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useRootStore } from "~/stores/root";
import type { SyncStore } from "~/stores/sync";
import type { TenantStore } from "~/stores/tenants";
import type { UserStore } from "~/stores/users";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  const rootStore = useRootStore();
  const usersStore = rootStore.users;
  const tenantsStore = rootStore.tenants;
  // const subscriptionsStore = rootStore.subscriptions;
  // const invoicesStore = rootStore.invoices;

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen">
      <TableSection
        syncer={usersStore.syncer}
        className="border-b-2 border-r-2"
      >
        <UsersContent />
      </TableSection>

      <TableSection syncer={tenantsStore.syncer} className="border-b-2">
        <TenantsContent />
      </TableSection>

      <TableSection syncer={usersStore.syncer} className="border-r-2">
        <UsersContent />
      </TableSection>

      <TableSection syncer={tenantsStore.syncer}>
        <TenantsContent />
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
    <div className="even:bg-gray-300 even:bg-opacity-5 px-4 py-1 text-gray-400 text-sm flex gap-5">
      <div>{user.username}</div>
      <div>
        {user.tenant?.maybeCurrent?.name ??
          `tenant ${user.tenant_id} not found`}
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
  return (
    <div className="even:bg-gray-300 even:bg-opacity-5 px-4 py-1 text-gray-400 text-sm flex gap-5">
      <div>{tenant.name}</div>
      <div>({tenant.users.size} users)</div>
    </div>
  );
});
