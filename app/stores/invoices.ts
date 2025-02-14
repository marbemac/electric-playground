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

export type InvoiceCreationData = SetRequired<
	ModelCreationData<InvoiceStore>,
	"id"
>;

@model("el/InvoicesStore")
export class InvoicesStore
	extends Model({
		syncer: prop<SyncStore>(() => new SyncStore({ table: "invoices" })),
		records: prop<Record<string, InvoiceStore>>(() => ({})),
	})
	implements SyncableStore<InvoiceCreationData>
{
	@modelAction
	insert(record: InvoiceCreationData) {
		return insertRecord(this.records, InvoiceStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<InvoiceCreationData>, "id">) {
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

@model("el/InvoiceStore")
export class InvoiceStore extends Model({
	id: idProp,
	subscription_id: prop<string>(),
	total: prop<number>(),
	created_at: prop<string>(),
}) {
	@computed
	get subscription() {
		return getRoot<RootStore>(this).subscriptions.records[this.subscription_id];
	}
}
