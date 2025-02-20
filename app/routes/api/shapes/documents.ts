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
		const controller = new AbortController();
		let unsubscribe: (() => void) | undefined;
		let abortedDueToTenantChange = false;

		if (!userId) {
			where = "visibility = 'public'";
		} else {
			const userTenantsShape = getUserTenants(userId);
			const userTenants = await userTenantsShape.rows;
			const authorCondition = `created_by = '${userId}'`;

			// re the ::text cast, see https://github.com/electric-sql/electric/issues/2360
			const tenantCondition = `tenant_id::text IN (${userTenants.map((t) => `'${t.tenant_id}'`).join(",")})`;

			where = `
				visibility = 'public' OR ${authorCondition} OR ${tenantCondition}
			`;

			// Set up subscription to tenant changes
			unsubscribe = userTenantsShape.subscribe(() => {
				abortedDueToTenantChange = true;
				controller.abort();
			});
		}

		originUrl.searchParams.set(`where`, where.trim());

		try {
			const resp = await fetch(originUrl, {
				signal: controller.signal,
			});

			// Create a new stream that we can use to cleanup the subscription
			const stream = new ReadableStream({
				async start(controller) {
					const reader = resp.body?.getReader();
					if (!reader) {
						unsubscribe?.();
						controller.close();
						return;
					}

					async function push() {
						if (!reader) return;

						try {
							const { done, value } = await reader.read();

							if (done) {
								unsubscribe?.();
								controller.close();
								return;
							}

							controller.enqueue(value);

							push();
						} catch (error) {
							unsubscribe?.();
							controller.error(error);
						}
					}

					push();
				},
				cancel() {
					unsubscribe?.();
				},
			});

			if (resp.headers.get("content-encoding")) {
				const headers = new Headers(resp.headers);
				headers.delete("content-encoding");
				headers.delete("content-length");
				return new Response(stream, {
					status: resp.status,
					statusText: resp.statusText,
					headers,
				});
			}

			return new Response(stream, {
				status: resp.status,
				statusText: resp.statusText,
				headers: resp.headers,
			});
		} catch (error) {
			unsubscribe?.();

			if (abortedDueToTenantChange) {
				return new Response(null, {
					status: 409, // Reset Content - indicating client should reset its view, or could send 205 but electric client doesn't do anything special w it
					statusText: "Changes detected",
				});
			}

			throw error; // Re-throw other errors
		}
	},
});
