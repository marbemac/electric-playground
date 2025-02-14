import {
	Model,
	type ModelCreationData,
	detach,
	getRefsResolvingTo,
	idProp,
	model,
	modelAction,
	prop,
	rootRef,
} from "mobx-keystone";
import type { SetRequired } from "type-fest";

import { computed } from "mobx";
import {
	SyncStore,
	type SyncableStore,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";

export const tenantRef = rootRef<TenantStore>("el/TenantRef", {
	onResolvedValueChange(ref, newRecord, oldRecord) {
		if (oldRecord && !newRecord) detach(ref);
	},
});

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
		return getRefsResolvingTo(this, tenantRef);
	}
}
