import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useUserTenantsSyncer = () => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "user_tenants",
		target: rootStore.userTenants,
		shapeStream: {
			url: "/api/shapes/any",
			params: {
				table: "user_tenants",
			},
		},
	});
};
