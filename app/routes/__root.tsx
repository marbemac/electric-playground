import { config } from "@fortawesome/fontawesome-svg-core";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.tsx";
import { NotFound } from "~/components/NotFound.tsx";
import { Providers } from "~/providers.tsx";
import appCss from "~/styles/app.css?url";

import { Gutter } from "./-components/Gutter.tsx";

config.autoAddCss = false;

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

    scripts: [
      {
        src: "https://unpkg.com/react-scan/dist/auto.global.js",
      },
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="flex">
        <Providers>
          <div className="border-r shrink-0 h-screen">
            <Gutter />
          </div>

          <div className="flex flex-1">{children}</div>
        </Providers>

        {/* <TanStackRouterDevtools position="bottom-right" /> */}
        <Scripts />
      </body>
    </html>
  );
}
