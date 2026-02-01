/**
 * 阶段6：选举提示词配置
 * 从多次生成结果中选出最优的一个
 */

export const ELECTION_SYSTEM_PROMPT = `选出最优春联。输出JSON。`;

export function buildElectionPrompt(
  candidates: Array<{
    upperCouplet: string;
    lowerCouplet: string;
  }>,
  wordCount: string
): string {
  return `从${candidates.length}个候选中选最优。

${candidates.map((c, i) => `候选${i + 1}：${c.upperCouplet} / ${c.lowerCouplet}`).join('\n')}

要求：字数${wordCount}字，通顺对仗。

输出：{"selectedIndex":索引,"reason":"理由"}`;
}
