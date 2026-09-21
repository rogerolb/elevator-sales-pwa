import { ProviderResult, buildUserInput, commonInstructions, env } from "./ai_types.ts";

export async function callDeepSeek(req: any): Promise<ProviderResult> {
  const key=env("DEEPSEEK_API_KEY");
  const model=env("AI_DEEPSEEK_MODEL") || "deepseek-v4-flash";
  if(!key) throw new Error("DEEPSEEK_API_KEY未設定");
  const r=await fetch("https://api.deepseek.com/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${key}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model,
      messages:[
        {role:"system",content:commonInstructions()},
        {role:"user",content:buildUserInput(req)}
      ],
      stream:false
    })
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message || `DeepSeek HTTP ${r.status}`);
  const answer=String(data?.choices?.[0]?.message?.content||"").trim();
  return {answer:answer||"回答を取得できませんでした。",provider:"deepseek",model};
}
