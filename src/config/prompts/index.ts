/**
 * 提示词配置统一导出
 */

export {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt
} from "./analysis.prompt";

export {
  SPRING_GENERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
  type GenerationHistory
} from "./generation.prompt";

export {
  REVIEW_SYSTEM_PROMPT,
  buildReviewPrompt,
  type ReviewHistory
} from "./review.prompt";

export {
  ELECTION_SYSTEM_PROMPT,
  buildElectionPrompt
} from "./election.prompt";
