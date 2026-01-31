import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { OpenAIService } from "../services/openai.service";
import { SpringWorkflowService } from "../services/spring-workflow.service";
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
  method: "post",
  path: "/v1/models",
  tags: ["OpenAI"],
  summary: "获取模型列表",
  description: `
通过配置的 API URL 和 API Key 获取 OpenAI 兼容的模型列表。

## 认证方式

支持两种认证方式：
1. **请求体认证**：在请求体中传递 \`apiUrl\` 和 \`apiKey\`
2. **环境变量**：配置 \`OPENAI_API_KEY\` 和 \`OPENAI_BASE_URL\` 环境变量

## 使用示例

\`\`\`bash
# 使用请求体认证
curl -X POST http://localhost:3000/v1/models \\
  -H "Content-Type: application/json" \\
  -d '{"apiUrl": "https://api.openai.com", "apiKey": "sk-your-api-key"}'

# 使用环境变量认证
curl -X POST http://localhost:3000/v1/models
\`\`\`
  `,
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
  let apiKey = "";
  let baseUrl = "";

  try {
    const body = await c.req.json().catch(() => ({}));
    apiKey = body.apiKey || "";
    baseUrl = body.apiUrl || "";
  } catch {
  }

  if (!apiKey) {
    apiKey = getEnvVar(c, "OPENAI_API_KEY") || "";
  }

  if (!baseUrl) {
    baseUrl = getEnvVar(c, "OPENAI_BASE_URL") || "https://api.openai.com";
  }

  if (!apiKey) {
    return c.json({
      error: {
        message: "未配置 API Key，请在设置中配置或设置环境变量 OPENAI_API_KEY",
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

// 春联生成路由
const generateSpringFestivalRoute = createRoute({
  method: "post",
  path: "/v1/spring-festival/generate",
  tags: ["SpringFestival"],
  summary: "生成春联和挥春（两阶段工作流）",
  description: `
根据用户提供的主题，通过两阶段工作流生成春联和挥春。

## 工作流说明
1. **阶段1 - 主题分析**：LLM深入分析主题，提取文化意象、关键词汇、对仗方向等
2. **阶段2 - 春联生成**：基于分析结果生成结构化的春联和挥春

这种两阶段方式能够生成更具文化内涵和创意性的春联作品。

## 请求参数
- topic: 主题内容，如"龙年"、"科技"、"家庭"等
- model: 使用的模型ID
- includeAnalysis: 是否在响应中包含主题分析结果（可选，默认false）

## 响应内容
- upperCouplet: 上联
- lowerCouplet: 下联
- horizontalScroll: 横批
- springScrolls: 四个挥春
- analysis: 主题分析结果（仅当includeAnalysis为true时返回）
  `,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            topic: z.string().min(1).max(50).describe("主题内容"),
            model: z.string().min(1).describe("模型ID"),
            apiUrl: z.string().optional().describe("API URL"),
            apiKey: z.string().optional().describe("API Key"),
            includeAnalysis: z.boolean().optional().describe("是否包含主题分析结果")
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "成功生成春联",
      content: {
        "application/json": {
          schema: z.object({
            upperCouplet: z.string().describe("上联"),
            lowerCouplet: z.string().describe("下联"),
            horizontalScroll: z.string().describe("横批"),
            springScrolls: z.array(z.string()).describe("四个挥春"),
            analysis: z.object({
              themeCore: z.string().describe("主题核心"),
              culturalImagery: z.array(z.string()).describe("文化意象"),
              emotionalTone: z.string().describe("情感基调"),
              keyNouns: z.array(z.string()).describe("核心名词"),
              keyVerbs: z.array(z.string()).describe("核心动词"),
              keyAdjectives: z.array(z.string()).describe("核心形容词"),
              coupletPairs: z.array(z.object({
                upper: z.string(),
                lower: z.string()
              })).describe("对仗方向"),
              horizontalDirection: z.string().describe("横批方向"),
              scrollThemes: z.array(z.object({
                theme: z.string(),
                keywords: z.array(z.string())
              })).describe("挥春主题")
            }).optional().describe("主题分析结果")
          })
        }
      }
    },
    400: {
      description: "请求参数错误"
    },
    500: {
      description: "服务器内部错误"
    }
  }
});

const generateSpringFestivalHandler = async (c: any) => {
  const body = await c.req.json();
  const { topic, model, apiUrl: requestApiUrl, apiKey: requestApiKey, includeAnalysis } = body;

  if (!topic || !model) {
    return c.json({
      error: {
        message: "缺少必要参数：topic 和 model",
        type: "invalid_request_error",
        code: "missing_params"
      }
    }, 400);
  }

  const apiKey = requestApiKey || getEnvVar(c, "OPENAI_API_KEY");
  const baseUrl = requestApiUrl || getEnvVar(c, "OPENAI_BASE_URL") || "https://api.openai.com";

  if (!apiKey) {
    return c.json({
      error: {
        message: "未配置 API Key，请在设置中配置或设置环境变量 OPENAI_API_KEY",
        type: "invalid_request_error",
        code: "missing_api_key"
      }
    }, 401);
  }

  try {
    // 使用新的两阶段工作流服务
    const workflowService = new SpringWorkflowService(baseUrl, apiKey, model);
    const result = await workflowService.executeWorkflow(topic, includeAnalysis === true);

    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return c.json({
      error: {
        message,
        type: "api_error",
        code: "generation_failed"
      }
    }, 500);
  }
};

app.openapi(generateSpringFestivalRoute, generateSpringFestivalHandler);

export default app;