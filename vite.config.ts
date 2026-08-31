// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

const BACKEND_URL = process.env["BACKEND_URL"] ?? "http://localhost:5000";
const API_PREFIX = "/api/v1";

/**
 * Forwards /api/v1/* requests to the Express backend during development.
 * Implemented as middleware because the sandbox config strips server.proxy.
 */
function backendApiProxy(): Plugin {
  return {
    name: "stayhub:backend-api-proxy",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith(API_PREFIX)) return next();

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (["host", "connection", "content-length"].includes(key)) continue;
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
          }

          const method = req.method ?? "GET";
          const body =
            method === "GET" || method === "HEAD" || chunks.length === 0
              ? undefined
              : Buffer.concat(chunks);

          fetch(`${BACKEND_URL}${url}`, {
            method,
            headers,
            ...(body ? { body } : {}),
          })
            .then(async (upstream) => {
              res.statusCode = upstream.status;
              upstream.headers.forEach((value, key) => {
                if (key === "content-encoding" || key === "content-length") return;
                res.setHeader(key, value);
              });
              res.end(Buffer.from(await upstream.arrayBuffer()));
            })
            .catch(() => {
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ success: false, message: "Backend is unreachable" }));
            });
        });
      });
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [backendApiProxy()],
  },
});
