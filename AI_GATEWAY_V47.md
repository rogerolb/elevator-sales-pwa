# AI共通ゲートウェイ v4.7

対応:
- OpenAI API
- Anthropic Claude API
- Google Gemini API
- DeepSeek API
- DeepSeek 指定チャット（APIなし手動引継ぎ）

## DeepSeek API
Supabase Secrets:
- DEEPSEEK_API_KEY
- AI_DEEPSEEK_MODEL=deepseek-v4-flash

PWAからは他AIと同じ `ai` Edge Functionを呼ぶ。

## DeepSeek 指定チャット
API契約なしでも利用可能。

管理 → AIプロバイダー → DeepSeek指定チャットURL
に任意のDeepSeekチャットURLを保存。

⑤AIで「DeepSeek 指定チャット」を選ぶと:
1. 物件コンテキスト付き質問文を生成
2. クリップボードへコピー
3. 指定チャットURLを新しいタブで開く
4. ユーザーが貼り付けて送信

Webチャットへの自動投稿は行わない。
ログイン状態・Web UI変更・ブラウザ制約に依存するため。
