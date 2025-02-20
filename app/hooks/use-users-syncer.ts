import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useUsersSyncer = () => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "users",
		target: rootStore.users,
		shapeStream: {
			url: "/api/shapes/any",
			params: {
				table: "users",
			},
		},
	});
};
