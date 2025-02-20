import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useDocumentsSyncer = ({ userId }: { userId?: string }) => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "documents",
		target: rootStore.documents,
		shapeStream: {
			url: "/api/shapes/documents",
			params: {
				userId,
			},
		},
	});
};
