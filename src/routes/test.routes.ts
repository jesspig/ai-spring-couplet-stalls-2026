import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { OpenAIService } from "../services/openai.service";
import type { OpenAIModel } from "../types/openai";

const app = new OpenAPIHono();

/**
 * 测试模型连接请求体
 */
const testModelsRequestSchema = z.object({
  baseUrl: z.string().url().describe("API 基础 URL"),
  apiKey: z.string().min(1).describe("API Key")
});

/**
 * 测试模型连接响应
 */
const testModelsResponseSchema = z.object({
  success: z.boolean().describe("是否成功"),
  models: z.array(z.object({
    id: z.string().describe("模型 ID"),
    object: z.string().describe("对象类型"),
    created: z.number().describe("创建时间戳"),
    owned_by: z.string().describe("所有者")
  })).describe("模型列表"),
  error: z.string().optional().describe("错误信息")
});

/**
 * 测试模型连接路由定义
 */
const testModelsRoute = createRoute({
  method: "post",
  path: "/api/test-models",
  tags: ["测试"],
  summary: "测试模型 API 连接",
  description: "测试提供的 API URL 和 API Key 是否可以成功获取模型列表",
  request: {
    body: {
      content: {
        "application/json": {
          schema: testModelsRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: "测试结果",
      content: {
        "application/json": {
          schema: testModelsResponseSchema
        }
      }
    }
  }
});

/**
 * 测试模型连接处理器
 */
const testModelsHandler = async (c: any) => {
  const { baseUrl, apiKey } = c.req.valid("json");

  console.log(`[TestModels] 收到测试请求, baseUrl: ${baseUrl}`);

  try {
    const service = new OpenAIService(baseUrl, apiKey);
    const models: OpenAIModel[] = await service.getModels();

    console.log(`[TestModels] 获取到 ${models.length} 个模型`);

    return c.json({
      success: true,
      models: models
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.error(`[TestModels] 错误: ${message}`);
    return c.json({
      success: false,
      models: [],
      error: message
    }, 200);
  }
};

app.openapi(testModelsRoute, testModelsHandler);

export default app;
