import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { OpenAIService } from "../services/openai.service";
import type { OpenAIModel } from "../types/openai";
import {
  SPRING_FESTIVAL_SYSTEM_PROMPT,
  buildUserPrompt,
  type SpringFestivalResponse
} from "../config/spring-festival.config";

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
  summary: "生成春联和挥春",
  description: `
根据用户提供的主题，生成一副春联（上联、下联、横批）以及四个挥春。

## 请求参数
- topic: 主题内容，如"龙年"、"科技"、"家庭"等
- model: 使用的模型ID

## 响应内容
- upperCouplet: 上联
- lowerCouplet: 下联
- horizontalScroll: 横批
- springScrolls: 四个挥春
  `,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            topic: z.string().min(1).max(50).describe("主题内容"),
            model: z.string().min(1).describe("模型ID"),
            apiUrl: z.string().optional().describe("API URL"),
            apiKey: z.string().optional().describe("API Key")
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
            springScrolls: z.array(z.string()).describe("四个挥春")
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
  const { topic, model, apiUrl: requestApiUrl, apiKey: requestApiKey } = body;

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
    const userPrompt = buildUserPrompt(topic);

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SPRING_FESTIVAL_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM返回内容为空");
    }

    // 解析JSON响应
    let result: SpringFestivalResponse;
    try {
      // 尝试直接解析
      result = JSON.parse(content);
    } catch {
      // 尝试从markdown代码块中提取
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) ||
                        content.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim());
      } else {
        // 尝试提取花括号内的内容
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          result = JSON.parse(braceMatch[0]);
        } else {
          throw new Error("无法解析LLM返回的JSON");
        }
      }
    }

    // 验证响应结构
    if (!result.upperCouplet || !result.lowerCouplet ||
        !result.horizontalScroll || !Array.isArray(result.springScrolls)) {
      throw new Error("LLM返回的数据结构不完整");
    }

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