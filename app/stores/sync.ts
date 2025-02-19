import {
	FetchError,
	type Message,
	type Offset,
	type ShapeStream,
	type ShapeStreamOptions,
	isChangeMessage,
	isControlMessage,
} from "@electric-sql/client";
import { getShapeStream } from "@electric-sql/react";
import { autorun, computed, makeAutoObservable } from "mobx";
import {
	Model,
	type Patch,
	applyPatches,
	getParent,
	model,
	modelAction,
	prop,
} from "mobx-keystone";

export interface SyncableStore<
	T extends Record<string, unknown> = Record<string, unknown>,
> {
	syncer: SyncStore;
	insert: (record: T) => void;
	update: (record: { id: string } & Partial<T>) => void;
	remove: (id: string) => void;
	clear: () => void;
}

@model("el/SyncStore")
export class SyncStore extends Model({
	table: prop<string>(),
	isPaused: prop<boolean>(true),
	isSyncing: prop<boolean>(false),
	hasError: prop<boolean>(false),
}) {
	private controller: AbortController | undefined;
	private stream: ShapeStream<{ id: string }> | undefined;
	private unsubscribe: (() => void) | undefined;
	private lastOffset: Offset | undefined;
	private lastShapeHandle: string | undefined;
	private _error: FetchError | null = null;

	private get collection() {
		return getParent<SyncableStore>(this)!;
	}

	onAttachedToRootStore() {
		const disposables: (() => void)[] = [];

		if (!import.meta.env.SSR) {
			disposables.push(
				autorun(() => {
					localStorage.setItem(
						`el-sync-${this.table}`,
						JSON.stringify({ isPaused: this.isPaused }),
					);
				}),
			);
		}

		if (!import.meta.env.SSR) {
			const stored = localStorage.getItem(`el-sync-${this.table}`);
			if (stored) {
				const { isPaused } = JSON.parse(stored);
				this.isPaused = isPaused;
			}
		}

		return () => disposables.forEach((d) => d());
	}

	@computed
	get error() {
		return this.hasError ? this._error : null;
	}

	private set error(error: FetchError | null) {
		this._error = error;
		this.hasError = !!error;
	}

	@modelAction
	togglePause() {
		if (this.isPaused) {
			this.start();
		} else {
			this.stop();
		}

		this.isPaused = !this.isPaused;
	}

	@modelAction
	start({
		shapeStreamOptions,
	}: { shapeStreamOptions?: Omit<Partial<ShapeStreamOptions>, "table"> } = {}) {
		this.controller = new AbortController();

		this.stream = makeAutoObservable(
			getShapeStream<{ id: string }>({
				url: new URL(`/api/shapes`, window.location.origin).href,
				signal: this.controller.signal,
				offset: this.lastOffset,
				handle: this.lastShapeHandle,
				...shapeStreamOptions,
				params: {
					...shapeStreamOptions?.params,
					table: this.table,
				},
			}),
		);

		this.unsubscribe = this.stream.subscribe(
			this.processMessages.bind(this),
			this.handleError.bind(this),
		);

		this.isSyncing = true;
	}

	@modelAction
	stop() {
		this.unsubscribe?.();
		this.controller?.abort();
		this.lastOffset = this.stream?.lastOffset;
		this.lastShapeHandle = this.stream?.shapeHandle;
		this.controller = undefined;
		this.stream = undefined;
		this.isSyncing = false;
	}

	@modelAction
	private processMessages(messages: Message<{ id: string }>[]) {
		for (const message of messages) {
			if (isChangeMessage(message)) {
				// console.log(message.headers.operation, message.value);
				switch (message.headers.operation) {
					case `insert`:
						this.collection.insert(message.value);
						break;
					case `update`:
						this.collection.update(message.value);
						break;
					case `delete`:
						this.collection.remove(message.value.id);
						break;
				}
			}

			if (isControlMessage(message)) {
				switch (message.headers.control) {
					case `up-to-date`:
						console.log("!! up-to-date", this.table);
						break;
					case `must-refetch`:
						console.log("!! must-refetch", this.table);
						this.collection.clear();
						this.error = null;
						break;
				}
			}
		}
	}

	@modelAction
	private handleError(e: Error) {
		if (e instanceof FetchError) {
			this.error = e;
		} else {
			console.error("Unknown sync error", e);
		}
	}
}

export const insertRecord = <T, P extends { id: string }>(
	records: Record<string, T>,
	model: new (data: P) => T,
	props: P,
): T => {
	let existing = records[props.id];
	if (!existing) {
		existing = new model(props);
		records[props.id] = existing;
	}

	return existing;
};

export const updateRecord = <T extends { id: string }>(
	records: Record<string, T>,
	props: { id: string } & Partial<T>,
) => {
	const record = records[props.id];
	if (!record) {
		console.warn("No record found to update", props.id, props);
		return;
	}

	const patches: Patch[] = Object.entries(props)
		.filter(([key]) => key !== "id")
		.map(([key, value]) => ({
			op: "replace",
			path: [key],
			value,
		}));

	applyPatches(record, patches);
	return record;
};

export const removeRecord = <T extends { id: string }>(
	records: Record<string, T>,
	id: string,
) => {
	if (records[id]) {
		delete records[id];
	}
};
