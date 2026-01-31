import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import openaiRoutes from "./routes/openai.routes";
import testRoutes from "./routes/test.routes";

export interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  ASSETS?: Fetcher;
}

const app = new OpenAPIHono<{ Bindings: Env }>();

if (typeof process !== "undefined") {
  app.use("*", async (c, next) => {
    c.env = {
      ...c.env,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL
    };
    await next();
  });
}

app.use("*", cors());
app.use("*", logger());
app.use("*", prettyJSON());

app.route("/", openaiRoutes);
app.route("/", testRoutes);

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "OpenAI Compatible API",
    description: "基于 Hono 实现的 OpenAI 兼容 API 服务",
    contact: {
      name: "API 支持",
      email: "support@example.com"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "本地开发服务器"
    },
    {
      url: "https://api.example.com",
      description: "生产服务器"
    }
  ],
  tags: [
    {
      name: "OpenAI",
      description: "OpenAI 兼容的 API 端点"
    }
  ]
});

app.get("/swagger-ui", swaggerUI({ url: "/doc" }));

app.get("/scalar", apiReference({
  url: "/doc",
  theme: "purple",
  layout: "modern",
  darkMode: true,
  metaData: {
    title: "OpenAI Compatible API - 文档",
    description: "基于 Hono 实现的 OpenAI 兼容 API 服务文档"
  }
}));

app.get("/scalar-light", apiReference({
  url: "/doc",
  theme: "default",
  layout: "classic",
  darkMode: false,
  metaData: {
    title: "OpenAI Compatible API - 文档（浅色）",
    description: "基于 Hono 实现的 OpenAI 兼容 API 服务文档"
  }
}));

app.get("/redoc", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ReDoc - API 文档</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <redoc spec-url='/doc'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `);
});

app.get("/", (c) => {
  return c.json({
    message: "OpenAI Compatible API",
    version: "1.0.0",
    description: "基于 Hono 实现的 OpenAI 兼容 API 服务",
    endpoints: {
      models: "/v1/models",
      documentation: {
        openapi: "/doc",
        swagger: "/swagger-ui",
        scalar: "/scalar",
        "scalar-light": "/scalar-light",
        redoc: "/redoc"
      }
    }
  });
});

export default app;