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
	type SubscriptionStore,
	subscriptionInvoiceRef,
} from "./subscriptions.ts";
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
	subscription: prop<Ref<SubscriptionStore> | undefined>(),
	total: prop<number>(),
	created_at: prop<string>(),
}) {
	onAttachedToRootStore() {
		const r: IReactionDisposer[] = [];

		r.push(
			reaction(
				() => this.subscription_id,
				() => this.setSubscriptionRef(),
				{ fireImmediately: true },
			),
		);

		return () => r.forEach((d) => d());
	}

	@modelAction
	private setSubscriptionRef() {
		this.subscription = this.subscription_id
			? subscriptionInvoiceRef(this.subscription_id)
			: undefined;
	}
}
