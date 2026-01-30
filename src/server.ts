import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./index";

const port = parseInt(process.env.PORT || "3000");
const host = process.env.HOST || "localhost";
const baseUrl = `http://${host}:${port}`;

console.log(`\n🚀 OpenAI Compatible API 服务已启动！\n`);
console.log(`📍 服务地址: ${baseUrl}`);
console.log(`📊 API 端点: ${baseUrl}/v1/models`);
console.log(`📚 文档地址:`);
console.log(`   - Swagger UI:  ${baseUrl}/swagger-ui`);
console.log(`   - Scalar:       ${baseUrl}/scalar`);
console.log(`   - Scalar Light: ${baseUrl}/scalar-light`);
console.log(`   - ReDoc:        ${baseUrl}/redoc`);
console.log(`   - OpenAPI:      ${baseUrl}/doc\n`);

serve({
  fetch: app.fetch,
  port
});