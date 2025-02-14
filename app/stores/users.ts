import { type IReactionDisposer, reaction } from "mobx";
import {
	Model,
	type ModelCreationData,
	type Ref,
	idProp,
	model,
	modelAction,
	prop,
} from "mobx-keystone";
import type { SetRequired } from "type-fest";

import {
	SyncStore,
	type SyncableStore,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";
import { type TenantStore, tenantRef } from "./tenants.ts";

export type UserCreationData = SetRequired<ModelCreationData<UserStore>, "id">;

@model("el/UsersStore")
export class UsersStore
	extends Model({
		syncer: prop<SyncStore>(() => new SyncStore({ table: "users" })),
		records: prop<Record<string, UserStore>>(() => ({})),
	})
	implements SyncableStore<UserCreationData>
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
	tenant_id: prop<string>(),
	tenant: prop<Ref<TenantStore> | undefined>(),
}) {
	onAttachedToRootStore() {
		const r: IReactionDisposer[] = [];

		r.push(
			reaction(
				() => this.tenant_id,
				() => this.setTenantRef(),
				{ fireImmediately: true },
			),
		);

		return () => r.forEach((d) => d());
	}

	@modelAction
	private setTenantRef() {
		this.tenant = this.tenant_id ? tenantRef(this.tenant_id) : undefined;
	}
}
