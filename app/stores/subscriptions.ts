import { type IReactionDisposer, computed, reaction } from "mobx";
import {
	Model,
	type ModelCreationData,
	type Ref,
	detach,
	getRefsResolvingTo,
	idProp,
	model,
	modelAction,
	prop,
	rootRef,
} from "mobx-keystone";
import type { SetRequired } from "type-fest";

import {
	SyncStore,
	type SyncableStore,
	insertRecord,
	removeRecord,
	updateRecord,
} from "./sync.ts";
import { type TenantStore, tenantSubscriptionRef } from "./tenants.ts";

export type SubscriptionCreationData = SetRequired<
	ModelCreationData<SubscriptionStore>,
	"id"
>;

export const subscriptionInvoiceRef = rootRef<SubscriptionStore>(
	"el/SubscriptionInvoiceRef",
	{
		onResolvedValueChange(ref, newRecord, oldRecord) {
			if (oldRecord && !newRecord) detach(ref);
		},
	},
);

@model("el/SubscriptionsStore")
export class SubscriptionsStore
	extends Model({
		syncer: prop<SyncStore>(() => new SyncStore({ table: "subscriptions" })),
		records: prop<Record<string, SubscriptionStore>>(() => ({})),
	})
	implements SyncableStore<SubscriptionCreationData>
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
	tenant: prop<Ref<TenantStore> | undefined>(),
	status: prop<string>(),
	started_at: prop<string>(),
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
		this.tenant = this.tenant_id
			? tenantSubscriptionRef(this.tenant_id)
			: undefined;
	}

	@computed
	get invoices() {
		return getRefsResolvingTo(this, subscriptionInvoiceRef);
	}
}
