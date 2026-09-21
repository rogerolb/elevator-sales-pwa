export type ProviderName = "openai" | "anthropic" | "gemini" | "deepseek";

export type GatewayRequest = {
  action?: "ask" | "status";
  question?: string;
  contexts?: string[];
  activeProperty?: Record<string, unknown>;
  provider?: ProviderName | "auto";
};

export type ProviderResult = {
  answer: string;
  provider: ProviderName;
  model: string;
};

export function env(name: string): string {
  return (Deno.env.get(name) ?? "").trim();
}

export function commonInstructions(): string {
  return [
    "あなたはエレベーター営業支援AIです。日本語で簡潔かつ実務的に回答してください。",
    "事実・ユーザー保存情報・推定を混同しないでください。",
    "不明なことは不明と明記してください。",
    "推定は必ず（推定）と明示してください。",
    "確認できていないEV台数を確定値として扱わないでください。",
    "非常用EVは物理総台数への加算ではなく内数として扱ってください。",
    "営業判断では、確認事項・根拠・次のアクションを分けてください。",
    "与えられたコンテキストだけでは断定できない最新情報は、確認が必要と明記してください。"
  ].join("\n");
}

export function buildUserInput(req: GatewayRequest): string {
  const contextNames = Array.isArray(req.contexts) ? req.contexts : [];
  const property = req.activeProperty && typeof req.activeProperty === "object" ? req.activeProperty : {};
  return [
    `質問: ${String(req.question ?? "").trim()}`,
    `参照カテゴリ: ${contextNames.join(" / ") || "指定なし"}`,
    `物件コンテキスト: ${JSON.stringify(property)}`,
    "",
    "回答は、必要に応じて「確認できていること」「推定」「営業上の次の一手」に分けてください。"
  ].join("\n");
}
