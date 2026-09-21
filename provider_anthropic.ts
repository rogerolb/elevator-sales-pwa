import { ProviderResult, buildUserInput, commonInstructions, env } from "./ai_types.ts";

export async function callAnthropic(req: any): Promise<ProviderResult> {
  const key = env("ANTHROPIC_API_KEY");
  const model = env("AI_ANTHROPIC_MODEL");
  if (!key) throw new Error("ANTHROPIC_API_KEY未設定");
  if (!model) throw new Error("AI_ANTHROPIC_MODEL未設定");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{
      "x-api-key":key,
      "anthropic-version":"2023-06-01",
      "content-type":"application/json"
    },
    body:JSON.stringify({
      model,
      max_tokens:1800,
      system:commonInstructions(),
      messages:[{role:"user",content:buildUserInput(req)}]
    })
  });
  const data=await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(data?.error?.message || `Anthropic HTTP ${r.status}`);
  const answer=(data?.content??[]).filter((x:any)=>x?.type==="text").map((x:any)=>x.text).join("\n").trim();
  return {answer:answer||"回答を取得できませんでした。",provider:"anthropic",model};
}
