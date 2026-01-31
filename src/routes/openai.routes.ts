import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { OpenAIService } from "../services/openai.service";
import type { OpenAIModel } from "../types/openai";

interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
}

const app = new OpenAPIHono<{ Bindings: Env }>();

const getEnvVar = (c: any, key: string): string => {
  return c.env?.[key] || (typeof process !== "undefined" ? process.env?.[key] : "") || "";
};

const getModelsRoute = createRoute({
  method: "get",
  path: "/v1/models",
  tags: ["OpenAI"],
  summary: "获取模型列表",
  description: `
通过配置的 API URL 和 API Key 获取 OpenAI 兼容的模型列表。

## 认证方式

支持两种认证方式：
1. **请求头认证**：在请求头中添加 \`Authorization: Bearer YOUR_API_KEY\`
2. **环境变量**：配置 \`OPENAI_API_KEY\` 环境变量

## 使用示例

\`\`\`bash
# 使用请求头认证
curl http://localhost:3000/v1/models \\
  -H "Authorization: Bearer sk-your-api-key"

# 使用环境变量认证
curl http://localhost:3000/v1/models
\`\`\`
  `,
  security: [
    {
      BearerAuth: []
    }
  ],
  responses: {
    200: {
      description: "成功返回模型列表",
      content: {
        "application/json": {
          schema: z.object({
            object: z.literal("list").describe("对象类型，固定为 'list'"),
            data: z.array(z.object({
              id: z.string().describe("模型唯一标识符"),
              object: z.literal("model").describe("对象类型，固定为 'model'"),
              created: z.number().describe("模型创建时间戳（Unix 时间戳）"),
              owned_by: z.string().describe("模型所有者")
            })).describe("模型列表")
          }),
          examples: {
            success: {
              summary: "成功响应示例",
              value: {
                object: "list",
                data: [
                  {
                    id: "gpt-4",
                    object: "model",
                    created: 1687882410,
                    owned_by: "openai"
                  },
                  {
                    id: "gpt-3.5-turbo",
                    object: "model",
                    created: 1677610602,
                    owned_by: "openai"
                  }
                ]
              }
            }
          }
        }
      }
    },
    401: {
      description: "认证失败 - 未提供有效的 API Key",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              message: z.string().describe("错误详情信息"),
              type: z.string().describe("错误类型"),
              code: z.string().describe("错误代码")
            })
          }),
          examples: {
            missingKey: {
              summary: "缺少 API Key",
              value: {
                error: {
                  message: "未提供 API Key，请在请求头中设置 Authorization 或配置环境变量 OPENAI_API_KEY",
                  type: "invalid_request_error",
                  code: "missing_api_key"
                }
              }
            },
            invalidKey: {
              summary: "无效的 API Key",
              value: {
                error: {
                  message: "无效的 API Key",
                  type: "invalid_request_error",
                  code: "invalid_api_key"
                }
              }
            }
          }
        }
      }
    },
    500: {
      description: "服务器内部错误 - 请求处理失败",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              message: z.string().describe("错误详情信息"),
              type: z.string().describe("错误类型"),
              code: z.string().describe("错误代码")
            })
          }),
          examples: {
            internalError: {
              summary: "内部服务器错误",
              value: {
                error: {
                  message: "获取模型列表失败: 500 Internal Server Error",
                  type: "api_error",
                  code: "internal_error"
                }
              }
            }
          }
        }
      }
    }
  }
});

const getModelsHandler = async (c: any) => {
  const authHeader = c.req.header("authorization");
  const apiKey = authHeader?.replace("Bearer ", "") || getEnvVar(c, "OPENAI_API_KEY") || "";
  const baseUrl = getEnvVar(c, "OPENAI_BASE_URL") || "https://api.openai.com";

  if (!apiKey) {
    return c.json({
      error: {
        message: "未提供 API Key，请在请求头中设置 Authorization 或配置环境变量 OPENAI_API_KEY",
        type: "invalid_request_error",
        code: "missing_api_key"
      }
    }, 401);
  }

  try {
    const service = new OpenAIService(baseUrl, apiKey);
    const models: OpenAIModel[] = await service.getModels();

    return c.json({
      object: "list",
      data: models
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return c.json({
      error: {
        message,
        type: "api_error",
        code: "internal_error",
        debug: {
          baseUrl,
          apiKeyPrefix: apiKey.substring(0, 8) + "..."
        }
      }
    }, 500);
  }
};

app.openapi(getModelsRoute, getModelsHandler);

export default app;