import { corsHeaders, json } from "../_shared/http.ts";
import { GatewayRequest, ProviderName, env } from "../_shared/ai_types.ts";
import { callOpenAI } from "../_shared/provider_openai.ts";
import { callAnthropic } from "../_shared/provider_anthropic.ts";
import { callGemini } from "../_shared/provider_gemini.ts";
import { callDeepSeek } from "../_shared/provider_deepseek.ts";

const VERSION="4.7";

function configured(provider: ProviderName) {
  if(provider==="openai") return Boolean(env("OPENAI_API_KEY"));
  if(provider==="anthropic") return Boolean(env("ANTHROPIC_API_KEY") && env("AI_ANTHROPIC_MODEL"));
  if(provider==="gemini") return Boolean(env("GEMINI_API_KEY") && env("AI_GEMINI_MODEL"));
  return Boolean(env("DEEPSEEK_API_KEY"));
}

function model(provider: ProviderName) {
  if(provider==="openai") return env("AI_OPENAI_MODEL") || "gpt-5.6-terra";
  if(provider==="anthropic") return env("AI_ANTHROPIC_MODEL");
  if(provider==="gemini") return env("AI_GEMINI_MODEL");
  return env("AI_DEEPSEEK_MODEL") || "deepseek-v4-flash";
}

function chooseProvider(req: GatewayRequest): ProviderName {
  const requested=req.provider;
  const defaultProvider=(env("AI_PROVIDER") || "openai") as ProviderName;
  const allowClient=(env("AI_ALLOW_CLIENT_PROVIDER_SWITCH") || "true").toLowerCase() === "true";
  if(allowClient && requested && requested!=="auto" && ["openai","anthropic","gemini","deepseek"].includes(requested)) return requested as ProviderName;
  return ["openai","anthropic","gemini","deepseek"].includes(defaultProvider) ? defaultProvider : "openai";
}

Deno.serve(async (request) => {
  if(request.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(request.method!=="POST") return json({error:"POST only"},405);

  const body:GatewayRequest=await request.json().catch(()=>({}));
  if(body.action==="status"){
    return json({
      ok:true,
      gatewayVersion:VERSION,
      defaultProvider:env("AI_PROVIDER") || "openai",
      clientSwitchAllowed:(env("AI_ALLOW_CLIENT_PROVIDER_SWITCH") || "true").toLowerCase()==="true",
      providers:{
        openai:{configured:configured("openai"),model:model("openai")},
        anthropic:{configured:configured("anthropic"),model:model("anthropic")},
        gemini:{configured:configured("gemini"),model:model("gemini")},
        deepseek:{configured:configured("deepseek"),model:model("deepseek")}
      }
    });
  }

  const question=String(body.question||"").trim();
  if(!question) return json({error:"question is required"},400);

  const provider=chooseProvider(body);
  if(!configured(provider)) return json({error:`${provider} provider is not configured`,provider},503);

  try{
    const result = provider==="openai"
      ? await callOpenAI(body)
      : provider==="anthropic"
        ? await callAnthropic(body)
        : provider==="gemini"
          ? await callGemini(body)
          : await callDeepSeek(body);
    return json({ok:true,...result,gatewayVersion:VERSION});
  }catch(e){
    return json({ok:false,error:e instanceof Error?e.message:String(e),provider,gatewayVersion:VERSION},502);
  }
});
