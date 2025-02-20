import { useRootStore } from "~/stores/root";
import { useSyncer } from "./use-syncer.ts";

export const useInvoicesSyncer = () => {
	const rootStore = useRootStore();

	return useSyncer({
		id: "invoices",
		target: rootStore.invoices,
		shapeStream: {
			url: "/api/shapes/any",
			params: {
				table: "invoices",
			},
		},
	});
};
