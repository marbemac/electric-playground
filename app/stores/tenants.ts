import {
	Model,
	type ModelCreationData,
	getRoot,
	idProp,
	model,
	modelAction,
	prop,
} from "mobx-keystone";
import type { SetRequired } from "type-fest";

import { computed } from "mobx";
import type { RootStore } from "./root.ts";
import {
	SyncStore,
	type SyncableStore,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";
import type { UserTenantStore } from "./user-tenants.ts";

export type TenantCreationData = SetRequired<
	ModelCreationData<TenantStore>,
	"id"
>;

@model("el/TenantsStore")
export class TenantsStore
	extends Model({
		syncer: prop<SyncStore>(() => new SyncStore({ table: "tenants" })),
		records: prop<Record<string, TenantStore>>(() => ({})),
	})
	implements SyncableStore<TenantCreationData>
{
	@modelAction
	insert(record: TenantCreationData) {
		return insertRecord(this.records, TenantStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<TenantCreationData>, "id">) {
		updateRecord(this.records, props);
	}

	@modelAction
	remove(id: string) {
		removeRecord(this.records, id);
	}

	@modelAction
	clear() {
		this.records = {};
	}
}

@model("el/TenantStore")
export class TenantStore extends Model({
	id: idProp,
	name: prop<string>(),
}) {
	@computed
	get userRelationships(): UserTenantStore[] {
		return getRoot<RootStore>(this).userTenants.byTenantId.get(this.id) || [];
	}

	@computed
	get users() {
		return this.userRelationships
			.map((rel: UserTenantStore) => rel.user)
			.filter(Boolean);
	}

	@computed
	get adminUsers() {
		return this.userRelationships
			.filter((rel: UserTenantStore) => rel.role === "admin")
			.map((rel: UserTenantStore) => rel.user)
			.filter(Boolean);
	}

	@computed
	get memberUsers() {
		return this.userRelationships
			.filter((rel: UserTenantStore) => rel.role === "member")
			.map((rel: UserTenantStore) => rel.user)
			.filter(Boolean);
	}

	@computed
	get userCount() {
		return this.users.length;
	}

	@computed
	get subscription() {
		return Object.values(getRoot<RootStore>(this).subscriptions.records).find(
			(r) => r.tenant_id === this.id,
		);
	}
}
