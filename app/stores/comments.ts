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

export type CommentCreationData = SetRequired<
	ModelCreationData<CommentStore>,
	"id"
>;

@model("el/CommentsStore")
export class CommentsStore
	extends Model({
		records: prop<Record<string, CommentStore>>(() => ({})),
	})
	implements SyncTarget<CommentCreationData>
{
	@modelAction
	insert(record: CommentCreationData) {
		return insertRecord(this.records, CommentStore, record);
	}

	@modelAction
	update(props: SetRequired<Partial<CommentCreationData>, "id">) {
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

@model("el/CommentStore")
export class CommentStore extends Model({
	id: idProp,
	document_id: prop<string>(),
	created_by: prop<string>(),
	content: prop<string>(),
	created_at: prop<string>(),
	updated_at: prop<string | null>(),
}) {
	@computed
	get createdBy() {
		return getRoot<RootStore>(this).users?.records[this.created_by];
	}

	@computed
	get document() {
		return getRoot<RootStore>(this).documents?.records[this.document_id];
	}
}
