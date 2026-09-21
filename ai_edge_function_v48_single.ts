// Elevator Sales AI Gateway v4.7 - single file
// Providers: OpenAI / Claude / Gemini / DeepSeek
// Secrets stay in Supabase Edge Function Secrets.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Provider = "openai" | "anthropic" | "gemini" | "deepseek";

type GatewayRequest = {
  analysisMode?: "normal" | "estimation";
  researchPromptVersion?: string;
  action?: "ask" | "status";
  question?: string;
  contexts?: string[];
  activeProperty?: Record<string, unknown>;
  provider?: Provider | "auto";
};

function env(name: string): string {
  return (Deno.env.get(name) ?? "").trim();
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function instructions(): string {
  return [
    "あなたはエレベーター営業支援AIです。日本語で簡潔かつ実務的に回答してください。",
    "事実・ユーザー保存情報・推定を混同しないでください。",
    "不明なことは「不明」と明記してください。",
    "推定は必ず（推定）と明示してください。",
    "確認できていないEV台数を確定値として扱わないでください。",
    "非常用EVは物理総台数への加算ではなく内数として扱ってください。",
    "回答は必要に応じて「確認できていること」「推定」「営業上の次の一手」に分けてください。"
  ].join("\n");
}

function estimationInstructions(): string {
  return [
    "台数推定・削減効果モード。",
    "EV・ES・DWを最小～最大レンジで示す。確定値があれば優先し「確定」と明記する。",
    "保守削減: EV年30万円/台、ES年48万円/台、DW年12万円/台。10年は年間×10。中央値で算出。",
    "リニューアル削減: EV年1000万円/台、DW年500万円/台、ESは原則未計上。中央値で算出。",
    "必ず①推定台数 ②推定根拠 ③誤差要因 ④追加で必要なデータを含める。",
    "一次情報を優先し、二次情報だけで0台と断定しない。",
    "サニティチェックは再調査フラグであり、公式・実測値を上書きしない。",
    "情報状態は確認実数・公開下限・法定最低・推定・不明を区別する。",
    "非常用仕様EVは物理総台数への加算ではなく内数。マップ記号数を物理台数と直結しない。",
    "DWは情報不足なら不明/推定＋要ヒアリング。"
  ].join("\n");
}

function userInput(req: GatewayRequest): string {
  const base = [
    `質問: ${String(req.question ?? "").trim()}`,
    `参照カテゴリ: ${(req.contexts ?? []).join(" / ") || "指定なし"}`,
    `物件コンテキスト: ${JSON.stringify(req.activeProperty ?? {})}`,
  ].join("\n");
  return req.analysisMode === "estimation"
    ? `${estimationInstructions()}\n\n${base}`
    : base;
}

function configured(p: Provider): boolean {
  if (p === "openai") return Boolean(env("OPENAI_API_KEY"));
  if (p === "anthropic") return Boolean(env("ANTHROPIC_API_KEY") && env("AI_ANTHROPIC_MODEL"));
  if (p === "gemini") return Boolean(env("GEMINI_API_KEY") && env("AI_GEMINI_MODEL"));
  return Boolean(env("DEEPSEEK_API_KEY"));
}

function modelFor(p: Provider): string {
  if (p === "openai") return env("AI_OPENAI_MODEL") || "gpt-5.6-terra";
  if (p === "anthropic") return env("AI_ANTHROPIC_MODEL");
  if (p === "gemini") return env("AI_GEMINI_MODEL");
  return env("AI_DEEPSEEK_MODEL") || "deepseek-chat";
}

function chooseProvider(req: GatewayRequest): Provider {
  const allowed: Provider[] = ["openai", "anthropic", "gemini", "deepseek"];
  const allowClient = (env("AI_ALLOW_CLIENT_PROVIDER_SWITCH") || "true").toLowerCase() === "true";
  if (allowClient && req.provider && req.provider !== "auto" && allowed.includes(req.provider as Provider)) {
    return req.provider as Provider;
  }
  const d = (env("AI_PROVIDER") || "openai") as Provider;
  return allowed.includes(d) ? d : "openai";
}

async function callOpenAI(req: GatewayRequest) {
  const key = env("OPENAI_API_KEY");
  const model = modelFor("openai");
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: instructions(),
      input: userInput(req),
      store: false,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${r.status}`);

  let answer = String(data?.output_text || "").trim();
  if (!answer) {
    const chunks: string[] = [];
    for (const item of data?.output ?? []) {
      for (const c of item?.content ?? []) {
        if (typeof c?.text === "string") chunks.push(c.text);
      }
    }
    answer = chunks.join("\n").trim();
  }
  return { answer: answer || "回答を取得できませんでした。", provider: "openai", model };
}

async function callAnthropic(req: GatewayRequest) {
  const key = env("ANTHROPIC_API_KEY");
  const model = modelFor("anthropic");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      system: instructions(),
      messages: [{ role: "user", content: userInput(req) }],
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `Anthropic HTTP ${r.status}`);
  const answer = (data?.content ?? [])
    .filter((x: any) => x?.type === "text")
    .map((x: any) => x.text)
    .join("\n")
    .trim();

  return { answer: answer || "回答を取得できませんでした。", provider: "anthropic", model };
}

async function callGemini(req: GatewayRequest) {
  const key = env("GEMINI_API_KEY");
  const model = modelFor("gemini");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions() }] },
      contents: [{ role: "user", parts: [{ text: userInput(req) }] }],
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `Gemini HTTP ${r.status}`);
  const answer = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((x: any) => typeof x?.text === "string" ? x.text : "")
    .filter(Boolean)
    .join("\n")
    .trim();

  return { answer: answer || "回答を取得できませんでした。", provider: "gemini", model };
}

async function callDeepSeek(req: GatewayRequest) {
  const key = env("DEEPSEEK_API_KEY");
  const model = modelFor("deepseek");
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: instructions() },
        { role: "user", content: userInput(req) },
      ],
      stream: false,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error?.message || `DeepSeek HTTP ${r.status}`);
  const answer = String(data?.choices?.[0]?.message?.content || "").trim();

  return { answer: answer || "回答を取得できませんでした。", provider: "deepseek", model };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  const req: GatewayRequest = await request.json().catch(() => ({}));

  if (req.action === "status") {
    return json({
      ok: true,
      gatewayVersion: "4.8",
      defaultProvider: env("AI_PROVIDER") || "openai",
      providers: {
        openai: { configured: configured("openai"), model: modelFor("openai") },
        anthropic: { configured: configured("anthropic"), model: modelFor("anthropic") },
        gemini: { configured: configured("gemini"), model: modelFor("gemini") },
        deepseek: { configured: configured("deepseek"), model: modelFor("deepseek") },
      },
    });
  }

  if (!String(req.question ?? "").trim()) {
    return json({ error: "question is required" }, 400);
  }

  const provider = chooseProvider(req);
  if (!configured(provider)) {
    return json({ error: `${provider} provider is not configured`, provider }, 503);
  }

  try {
    const result =
      provider === "openai" ? await callOpenAI(req) :
      provider === "anthropic" ? await callAnthropic(req) :
      provider === "gemini" ? await callGemini(req) :
      await callDeepSeek(req);

    return json({ ok: true, ...result, gatewayVersion: "4.8" });
  } catch (e) {
    return json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      provider,
      gatewayVersion: "4.8",
    }, 502);
  }
});
