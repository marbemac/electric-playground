import { Model, model, prop, registerRootStore } from "mobx-keystone";
import { createContext } from "~/utils/create-context.tsx";

import { CommentsStore } from "./comments.ts";
import { DocumentsStore } from "./documents.ts";
import { InvoicesStore } from "./invoices.ts";
import { SubscriptionsStore } from "./subscriptions.ts";
import { TenantsStore } from "./tenants.ts";
import { UserTenantsStore } from "./user-tenants.ts";
import { UsersStore } from "./users.ts";

export const [RootStoreContext, useRootStore] = createContext<RootStore>({
	name: "RootStoreContext",
	strict: true,
});

export function createRootStore(): RootStore {
	const rootStore = new RootStore({});

	registerRootStore(rootStore);

	if (typeof window !== "undefined") {
		// @ts-expect-error ignore
		window.__ROOT_STORE__ = rootStore;
	}

	return rootStore;
}

@model("el/RootStore")
export class RootStore extends Model({
	users: prop<UsersStore>(() => new UsersStore({})),
	tenants: prop<TenantsStore>(() => new TenantsStore({})),
	userTenants: prop<UserTenantsStore>(() => new UserTenantsStore({})),
	subscriptions: prop<SubscriptionsStore>(() => new SubscriptionsStore({})),
	invoices: prop<InvoicesStore>(() => new InvoicesStore({})),
	documents: prop<DocumentsStore>(() => new DocumentsStore({})),
	comments: prop<CommentsStore>(() => new CommentsStore({})),
}) {}
