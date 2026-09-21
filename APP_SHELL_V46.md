# 営業アプリ箱 v4.6

⑤AIをマルチAI対応に変更。

- OpenAI
- Anthropic Claude
- Google Gemini
- 自動選択

を1本のSupabase Edge Function `ai` で吸収する。

PWAはAI事業者固有APIを知らない。
AI変更時も①〜④、物件DB、保存データ、Supabase構造は維持。

現時点ではAIキー未設定のため、次工程はOpenAI APIキーをSupabase Secretsへ設定し、`ai` Functionをdeployすること。
