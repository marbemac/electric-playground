import { computed } from "mobx";
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

import type { RootStore } from "./root.ts";
import {
	type SyncTarget,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";

export type UserTenantCreationData = SetRequired<
	ModelCreationData<UserTenantStore>,
	"id"
>;

@model("el/UserTenantsStore")
export class UserTenantsStore
	extends Model({
		records: prop<Record<string, UserTenantStore>>(() => ({})),
	})
	implements SyncTarget<UserTenantCreationData>
{
	@modelAction
	insert(record: UserTenantCreationData) {
		return insertRecord(this.records, UserTenantStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<UserTenantCreationData>, "id">) {
		return updateRecord(this.records, props);
	}

	@modelAction
	remove(id: string) {
		removeRecord(this.records, id);
	}

	@modelAction
	clear() {
		this.records = {};
	}

	@computed
	get byUserId() {
		const map = new Map<string, UserTenantStore[]>();
		for (const record of Object.values(this.records)) {
			const arr = map.get(record.user_id) || [];
			arr.push(record);
			map.set(record.user_id, arr);
		}
		return map;
	}

	@computed
	get byTenantId() {
		const map = new Map<string, UserTenantStore[]>();
		for (const record of Object.values(this.records)) {
			const arr = map.get(record.tenant_id) || [];
			arr.push(record);
			map.set(record.tenant_id, arr);
		}
		return map;
	}
}

@model("el/UserTenantStore")
export class UserTenantStore extends Model({
	id: idProp,
	user_id: prop<string>(),
	tenant_id: prop<string>(),
	role: prop<"admin" | "member">(),
	created_at: prop<string>(),
}) {
	@computed
	get user() {
		return getRoot<RootStore>(this).users?.records[this.user_id];
	}

	@computed
	get tenant() {
		return getRoot<RootStore>(this).tenants?.records[this.tenant_id];
	}
}
