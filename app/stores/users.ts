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
import type { UserTenantStore } from "./user-tenants.ts";

export type UserCreationData = SetRequired<ModelCreationData<UserStore>, "id">;

@model("el/UsersStore")
export class UsersStore
	extends Model({
		records: prop<Record<string, UserStore>>(() => ({})),
	})
	implements SyncTarget<UserCreationData>
{
	@modelAction
	insert(record: UserCreationData) {
		return insertRecord(this.records, UserStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<UserCreationData>, "id">) {
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
}

@model("el/UserStore")
export class UserStore extends Model({
	id: idProp,
	username: prop<string>(),
}) {
	@computed
	get tenantRelationships(): UserTenantStore[] {
		return getRoot<RootStore>(this).userTenants?.byUserId.get(this.id) || [];
	}

	@computed
	get tenants() {
		return this.tenantRelationships
			.map((rel: UserTenantStore) => rel.tenant)
			.filter(Boolean);
	}

	@computed
	get adminTenants() {
		return this.tenantRelationships
			.filter((rel: UserTenantStore) => rel.role === "admin")
			.map((rel: UserTenantStore) => rel.tenant)
			.filter(Boolean);
	}

	@computed
	get memberTenants() {
		return this.tenantRelationships
			.filter((rel: UserTenantStore) => rel.role === "member")
			.map((rel: UserTenantStore) => rel.tenant)
			.filter(Boolean);
	}

	isAdminOfTenant(tenantId: string) {
		return this.tenantRelationships.some(
			(rel: UserTenantStore) =>
				rel.tenant_id === tenantId && rel.role === "admin",
		);
	}

	isMemberOfTenant(tenantId: string) {
		return this.tenantRelationships.some(
			(rel: UserTenantStore) =>
				rel.tenant_id === tenantId && rel.role === "member",
		);
	}

	hasAccessToTenant(tenantId: string) {
		return this.tenantRelationships.some(
			(rel: UserTenantStore) => rel.tenant_id === tenantId,
		);
	}
}
