import { ProviderResult, buildUserInput, commonInstructions, env } from "./ai_types.ts";

function extractText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const chunks: string[] = [];
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const c of item?.content ?? []) {
      if ((c?.type === "output_text" || c?.type === "text") && typeof c?.text === "string") chunks.push(c.text);
    }
  }
  return chunks.join("\n").trim();
}

export async function callOpenAI(req: any): Promise<ProviderResult> {
  const key = env("OPENAI_API_KEY");
  const model = env("AI_OPENAI_MODEL") || "gpt-5.6-terra";
  if (!key) throw new Error("OPENAI_API_KEY未設定");
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {"Authorization": `Bearer ${key}`, "Content-Type": "application/json"},
    body: JSON.stringify({
      model,
      instructions: commonInstructions(),
      input: buildUserInput(req),
      store: false
    })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${r.status}`);
  return {answer: extractText(data) || "回答を取得できませんでした。", provider:"openai", model};
}
