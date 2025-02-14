import { Model, model, prop, registerRootStore } from "mobx-keystone";
import { createContext } from "~/utils/create-context.tsx";

import { InvoicesStore } from "./invoices.ts";
import { SubscriptionsStore } from "./subscriptions.ts";
import { TenantsStore } from "./tenants.ts";
import { UsersStore } from "./users.ts";

export const [RootStoreContext, useRootStore] = createContext<RootStore>({
	name: "RootStoreContext",
	strict: true,
});

export function createRootStore(): RootStore {
	const rootStore = new RootStore({});

	registerRootStore(rootStore);

	return rootStore;
}

@model("el/RootStore")
class RootStore extends Model({
	users: prop<UsersStore>(() => new UsersStore({})),
	tenants: prop<TenantsStore>(() => new TenantsStore({})),
	subscriptions: prop<SubscriptionsStore>(() => new SubscriptionsStore({})),
	invoices: prop<InvoicesStore>(() => new InvoicesStore({})),
}) {}
