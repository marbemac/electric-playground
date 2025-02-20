import { Shape, ShapeStream } from "@electric-sql/client";
import { createAPIFileRoute } from "@tanstack/start/api";

const getUserTenants = (userId: string) => {
	const baseUrl = import.meta.env.VITE_ELECTRIC_URL;

	const shapeStream = new ShapeStream({
		url: new URL("/v1/shape", baseUrl).href,
		params: {
			table: "user_tenants",
			where: `"user_id" = '${userId}'`,
		},
	});

	return new Shape(shapeStream);
};

export const APIRoute = createAPIFileRoute("/api/shapes/documents")({
	GET: async ({ request }) => {
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

		originUrl.searchParams.set("table", "documents");

		let where = "";
		const userId = url.searchParams.get("userId");
		if (!userId) {
			where = "visibility = 'public'";
		} else {
			const userTenantsShape = getUserTenants(userId);
			const userTenants = await userTenantsShape.rows;
			const authorCondition = `created_by = '${userId}'`;
			const tenantCondition = `tenant_id IN (${userTenants.map((t) => `'${t.tenant_id}'`).join(",")})`;
			where = `
				visibility = 'public' OR ${authorCondition} OR ${tenantCondition}
			`;
			// where = `tenant_id IN ('t4')`;
			console.log(where);
		}

		originUrl.searchParams.set(`where`, where.trim());

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
