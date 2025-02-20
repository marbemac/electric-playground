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

export type SubscriptionCreationData = SetRequired<
	ModelCreationData<SubscriptionStore>,
	"id"
>;

@model("el/SubscriptionsStore")
export class SubscriptionsStore
	extends Model({
		records: prop<Record<string, SubscriptionStore>>(() => ({})),
	})
	implements SyncTarget<SubscriptionCreationData>
{
	@modelAction
	insert(record: SubscriptionCreationData) {
		return insertRecord(this.records, SubscriptionStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<SubscriptionCreationData>, "id">) {
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

@model("el/SubscriptionStore")
export class SubscriptionStore extends Model({
	id: idProp,
	tenant_id: prop<string>(),
	status: prop<string>(),
	started_at: prop<string>(),
}) {
	@computed
	get tenant() {
		return getRoot<RootStore>(this).tenants?.records[this.tenant_id];
	}

	@computed
	get invoices() {
		return Object.values(getRoot<RootStore>(this).invoices?.records).filter(
			(r) => r.subscription_id === this.id,
		);
	}

	@computed
	get totalInvoiced() {
		return this.invoices.reduce((acc, invoice) => acc + invoice.total, 0);
	}
}
