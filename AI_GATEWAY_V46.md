# AI共通ゲートウェイ v4.6

## 目的
PWA本体を特定AIに依存させない。

PWA
→ Supabase Edge Function `ai`
→ OpenAI / Anthropic Claude / Google Gemini

## PWAからの共通入力
- question
- contexts
- activeProperty
- provider = auto / openai / anthropic / gemini

## 共通出力
- answer
- provider
- model
- gatewayVersion

## 切替
管理 → AIプロバイダー、または⑤AI画面の「使用AI」。

`自動`の場合はSupabase Secret `AI_PROVIDER` を使用。

## Secrets
必須候補:
- AI_PROVIDER
- AI_ALLOW_CLIENT_PROVIDER_SWITCH
- OPENAI_API_KEY
- AI_OPENAI_MODEL
- ANTHROPIC_API_KEY
- AI_ANTHROPIC_MODEL
- GEMINI_API_KEY
- AI_GEMINI_MODEL

使わないプロバイダーのキーは設定不要。

## セキュリティ
APIキーはapp_config.jsやGitHub Pagesへ置かない。
Supabase Edge Function Secretsだけに置く。
