import { scan } from "react-scan";

import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Meta, Scripts } from "@tanstack/start";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.tsx";
import { NotFound } from "~/components/NotFound.tsx";
import { Providers } from "~/providers.tsx";
import appCss from "~/styles/app.css?url";

import { useEffect } from "react";
import { Syncer } from "./-components/Sync.tsx";

export const Route = createRootRouteWithContext<{}>()({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },

  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],

    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    scan({
      enabled: true,
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
      </head>

      <body>
        <Providers>
          {children}
          <Syncer />
        </Providers>

        {/* <TanStackRouterDevtools position="bottom-right" /> */}
        <Scripts />
      </body>
    </html>
  );
}
