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
import { autorun, makeAutoObservable, reaction } from "mobx";
import { type Patch, applyPatches } from "mobx-keystone";
import { createContext } from "~/utils/create-context";

export interface SyncTarget<T extends Record<string, unknown>> {
	insert: (record: { id: string } & T) => void;
	update: (record: { id: string } & T) => void;
	remove: (id: string) => void;
	clear: () => void;
}

export const [SyncersContext, useSyncers] = createContext<Syncers>({
	name: "SyncersContext",
	strict: true,
});

type SyncerId = string;

export type SyncableRecord<T> = T & { id: string };

export type InjectSyncerOptions<T extends SyncableRecord<unknown>> = {
	id: SyncerId;
	target: SyncTarget<T>;
	shapeStream: ShapeStreamOptions;
};

export class Syncers {
	private syncers: Record<SyncerId, SyncAltStore<any>> = {};

	constructor() {
		makeAutoObservable(this);
	}

	injectSyncer<T extends SyncableRecord<unknown>>({
		id,
		target,
		shapeStream,
	}: InjectSyncerOptions<T>) {
		if (!this.syncers[id]) {
			this.syncers[id] = new SyncAltStore(id, target, { shapeStream });
		}

		return this.syncers[id];
	}
}

export class SyncAltStore<T extends SyncableRecord<unknown>> {
	private controller: AbortController | undefined;
	private stream: ShapeStream<T> | undefined;
	private unsubscribe: (() => void) | undefined;
	private lastOffset: Offset | undefined;
	private lastShapeHandle: string | undefined;
	private _error: FetchError | null = null;

	private target?: SyncTarget<T>;
	private pendingStop: NodeJS.Timeout | undefined;
	private refCount = 0;

	#shapeStreamOptions: ShapeStreamOptions;

	id: SyncerId;
	isPaused = true;
	isSyncing = false;
	hasError = false;

	private disposables: (() => void)[] = [];

	constructor(
		id: SyncerId,
		target: SyncTarget<T>,
		{ shapeStream }: { shapeStream: ShapeStreamOptions },
	) {
		makeAutoObservable(this);

		this.id = id;
		this.target = target;
		this.#shapeStreamOptions = shapeStream ?? {};

		// if nothing is observing this syncer, stop it after 5 seconds
		this.disposables.push(
			reaction(
				() => this.refCount,
				() => {
					if (this.refCount === 0) {
						this.pendingStop = setTimeout(() => {
							this.stop();
						}, 5000);
					}
				},
				{ fireImmediately: false },
			),
		);

		if (!import.meta.env.SSR) {
			this.disposables.push(
				autorun(() => {
					localStorage.setItem(
						`el-sync-${this.id}`,
						JSON.stringify({ isPaused: this.isPaused }),
					);
				}),
			);

			const stored = localStorage.getItem(`el-sync-${this.id}`);
			if (stored) {
				const { isPaused } = JSON.parse(stored);
				this.isPaused = isPaused;
			}
		}

		// this.disposables.push(chunkProcessor())
	}

	dispose() {
		this.disposables.forEach((d) => d());
	}

	get error() {
		return this.hasError ? this._error : null;
	}

	private set error(error: FetchError | null) {
		this._error = error;
		this.hasError = !!error;
	}

	isEqualToCurrentShapeStreamOptions(options: ShapeStreamOptions) {
		return JSON.stringify(options) === JSON.stringify(this.#shapeStreamOptions);
	}

	updateShapeStreamOptions(options: ShapeStreamOptions) {
		this.#shapeStreamOptions = options;
		if (this.isSyncing) {
			console.log("!! updateShapeStreamOptions", this.id, options);
			this.reset();
			this.target?.clear();
			this.start();
		}
	}

	registerObserver() {
		this.refCount++;
		if (this.pendingStop) {
			clearTimeout(this.pendingStop);
			this.pendingStop = undefined;
		}
	}

	unregisterObserver() {
		this.refCount--;
	}

	togglePause() {
		if (this.isPaused) {
			this.start();
		} else {
			this.stop();
		}

		this.isPaused = !this.isPaused;
	}

	start() {
		this.controller = new AbortController();

		this.stream = getShapeStream<T>({
			signal: this.controller.signal,
			offset: this.lastOffset,
			handle: this.lastShapeHandle,
			...this.#shapeStreamOptions,
			url: new URL(this.#shapeStreamOptions.url, window.location.origin).href,
			params: {
				...this.#shapeStreamOptions?.params,
				// table: this.table,
			},
		});

		this.unsubscribe = this.stream.subscribe(
			this.processMessages.bind(this),
			this.handleError.bind(this),
		);

		this.isSyncing = true;
	}

	stop() {
		this.unsubscribe?.();
		this.controller?.abort();
		this.lastOffset = this.stream?.lastOffset;
		this.lastShapeHandle = this.stream?.shapeHandle;
		this.controller = undefined;
		this.stream = undefined;
		this.isSyncing = false;
	}

	reset() {
		this.stop();
		this.lastOffset = undefined;
		this.lastShapeHandle = undefined;
	}

	public processMessages(messages: Message<T>[]) {
		const target = this.target;
		if (!target) {
			return;
		}

		for (const message of messages) {
			if (isChangeMessage(message)) {
				// console.log(message.headers.operation, message.value);
				switch (message.headers.operation) {
					case `insert`:
						target.insert(message.value);
						break;
					case `update`:
						target.update(message.value);
						break;
					case `delete`:
						target.remove(message.value.id);
						break;
				}
			}

			if (isControlMessage(message)) {
				switch (message.headers.control) {
					case `up-to-date`:
						console.log("!! up-to-date", this.id);
						break;
					case `must-refetch`:
						console.log("!! must-refetch", this.id);
						target.clear();
						this.error = null;
						break;
				}
			}
		}
	}

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
