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
	readonly table = "tenants";

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
	get users() {
		return Object.values(getRoot<RootStore>(this).users.records).filter(
			(r) => r.tenant_id === this.id,
		);
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
