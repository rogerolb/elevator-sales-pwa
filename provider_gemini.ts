import { ProviderResult, buildUserInput, commonInstructions, env } from "./ai_types.ts";

export async function callGemini(req: any): Promise<ProviderResult> {
  const key=env("GEMINI_API_KEY");
  const model=env("AI_GEMINI_MODEL");
  if(!key) throw new Error("GEMINI_API_KEY未設定");
  if(!model) throw new Error("AI_GEMINI_MODEL未設定");
  const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const r=await fetch(url,{
    method:"POST",
    headers:{"x-goog-api-key":key,"Content-Type":"application/json"},
    body:JSON.stringify({
      systemInstruction:{parts:[{text:commonInstructions()}]},
      contents:[{role:"user",parts:[{text:buildUserInput(req)}]}]
    })
  });
  const data=await r.json().catch(() => ({}));
  if(!r.ok) throw new Error(data?.error?.message || `Gemini HTTP ${r.status}`);
  const parts=data?.candidates?.[0]?.content?.parts??[];
  const answer=parts.map((x:any)=>typeof x?.text==="string"?x.text:"").filter(Boolean).join("\n").trim();
  return {answer:answer||"回答を取得できませんでした。",provider:"gemini",model};
}
