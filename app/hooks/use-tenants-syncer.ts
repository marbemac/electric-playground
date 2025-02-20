import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useTenantsSyncer = () => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "tenants",
		target: rootStore.tenants,
		shapeStream: {
			url: "/api/shapes/any",
			params: {
				table: "tenants",
			},
		},
	});
};
