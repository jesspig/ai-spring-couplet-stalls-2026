import app from "./index";
import type { Env } from "./index";

interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  props: Record<string, any>;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/v1/") || url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/doc") || url.pathname.startsWith("/swagger-ui") ||
        url.pathname.startsWith("/scalar") || url.pathname.startsWith("/redoc")) {
      return app.fetch(request, env, ctx);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
