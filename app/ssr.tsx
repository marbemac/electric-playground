/// <reference types="vinxi/types/server" />
import { getRouterManifest } from "@tanstack/start/router-manifest";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/start/server";
import { enableStaticRendering } from "mobx-react-lite";

import { createRouter } from "./router.tsx";

enableStaticRendering(true);

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(defaultStreamHandler);
