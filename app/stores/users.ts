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
	SyncStore,
	type SyncableStore,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";

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
}) {
	@computed
	get tenant() {
		return getRoot<RootStore>(this).tenants.records[this.tenant_id];
	}
}
