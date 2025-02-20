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

export type DocumentCreationData = SetRequired<
	ModelCreationData<DocumentStore>,
	"id"
>;

@model("el/DocumentsStore")
export class DocumentsStore
	extends Model({
		records: prop<Record<string, DocumentStore>>(() => ({})),
	})
	implements SyncTarget<DocumentCreationData>
{
	@modelAction
	insert(record: DocumentCreationData) {
		return insertRecord(this.records, DocumentStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<DocumentCreationData>, "id">) {
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

@model("el/DocumentStore")
export class DocumentStore extends Model({
	id: idProp,
	title: prop<string>(),
	content: prop<string>(),
	status: prop<string>(),
	created_at: prop<string>(),
	created_by: prop<string>(),
	tenant_id: prop<string>(),
	updated_at: prop<string>(),
	visibility: prop<string>(),
}) {
	@computed
	get createdBy() {
		return getRoot<RootStore>(this).users?.records[this.created_by];
	}

	@computed
	get tenant() {
		return getRoot<RootStore>(this).tenants?.records[this.tenant_id];
	}

	@computed
	get comments() {
		return Object.values(getRoot<RootStore>(this).comments.records).filter(
			(comment) => comment.document_id === this.id,
		);
	}
}
