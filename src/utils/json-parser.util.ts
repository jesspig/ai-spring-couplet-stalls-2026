/**
 * 从LLM响应内容中解析JSON
 * 支持直接JSON、Markdown代码块、花括号提取等多种格式
 * @param content LLM返回的文本内容
 * @returns 解析后的对象
 * @throws 解析失败时抛出错误
 */
export function parseLLMJson<T>(content: string): T {
  // 尝试直接解析
  try {
    return JSON.parse(content) as T;
  } catch {
    // 继续尝试其他方式
  }

  // 尝试从markdown代码块中提取
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) ||
                    content.match(/```\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim()) as T;
  }

  // 尝试提取花括号内的内容
  const braceMatch = content.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return JSON.parse(braceMatch[0]) as T;
  }

  throw new Error("无法解析LLM返回的JSON");
}
