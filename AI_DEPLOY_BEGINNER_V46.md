# AIを実際に動かす手順 v4.6

まずOpenAIだけ接続し、Claude/Geminiは後から追加する。

1. OpenAI API側でAPIキーを作成
2. Supabase → Edge Functions → Secretsへ
   - OPENAI_API_KEY
   - AI_OPENAI_MODEL = gpt-5.6-terra
   - AI_PROVIDER = openai
   - AI_ALLOW_CLIENT_PROVIDER_SWITCH = true
3. Supabase Edge Function `ai` を作成
4. v4.6の `supabase/functions/ai/index.ts` と `_shared` の4ファイルを配置
5. Deploy
6. PWA → 管理 → AIプロバイダーで「OpenAI 設定済」を確認
7. ⑤AIに聞くから質問

Claude/Geminiを追加するときはPWAを作り直さず、Secretsとprovider moduleだけで切替可能。
