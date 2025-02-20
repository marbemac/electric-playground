import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute(
	"/api/shapes/documents/$documentId/comments",
)({
	GET: async ({ request, params }) => {
		const url = new URL(request.url);

		// Constuct the upstream URL
		const baseUrl = import.meta.env.VITE_ELECTRIC_URL;
		const originUrl = new URL("/v1/shape", baseUrl);

		// Copy over the relevant query params that the Electric client adds
		// so that we return the right part of the Shape log.
		url.searchParams.forEach((value, key) => {
			if (["live", "table", "handle", "offset", "cursor"].includes(key)) {
				originUrl.searchParams.set(key, value);
			}
		});

		originUrl.searchParams.set("table", "comments");

		// if (process.env.ELECTRIC_SOURCE_ID) {
		//   originUrl.searchParams.set(`source_id`, process.env.ELECTRIC_SOURCE_ID)
		// }

		// if (process.env.ELECTRIC_SOURCE_SECRET) {
		//   originUrl.searchParams.set(
		//     `source_secret`,
		//     process.env.ELECTRIC_SOURCE_SECRET
		//   )
		// }

		originUrl.searchParams.set(
			`where`,
			`"document_id" = '${params.documentId}'`,
		);

		// When proxying long-polling requests, content-encoding & content-length are added
		// erroneously (saying the body is gzipped when it's not) so we'll just remove
		// them to avoid content decoding errors in the browser.
		//
		// Similar-ish problem to https://github.com/wintercg/fetch/issues/23
		const resp = await fetch(originUrl);
		if (resp.headers.get("content-encoding")) {
			const headers = new Headers(resp.headers);
			headers.delete("content-encoding");
			headers.delete("content-length");
			return new Response(resp.body, {
				status: resp.status,
				statusText: resp.statusText,
				headers,
			});
		}

		return resp;
	},
});
