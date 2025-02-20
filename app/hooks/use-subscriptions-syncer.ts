import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useSubscriptionsSyncer = () => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "subscriptions",
		target: rootStore.subscriptions,
		shapeStream: {
			url: "/api/shapes/any",
			params: {
				table: "subscriptions",
			},
		},
	});
};
