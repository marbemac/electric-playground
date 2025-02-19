/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/start";
import { configure } from "mobx";
import { hydrateRoot } from "react-dom/client";

import { createRouter } from "./router.tsx";

configure({
  enforceActions: "always",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
  disableErrorBoundaries: true,
});

const router = createRouter();

hydrateRoot(document, <StartClient router={router} />);
