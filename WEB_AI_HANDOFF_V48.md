# Web AI連携 v4.8

API料金を使わずに、PWAから各Web AIへ質問を引き継ぐ。

対応:
- ChatGPT
- Gemini
- Claude
- DeepSeek

動作:
1. PWAで質問を作成
2. 通常会話 / 台数推定・削減効果 v2.6 を選択
3. Web AIボタンを押す
4. 質問・物件コンテキスト・必要なら検索プロンプトv2.6をクリップボードへコピー
5. 指定Webアプリ/指定チャットURLを開く
6. ユーザーが貼り付けて送信

管理 → AIプロバイダーで各Web AIのURLを変更可能。
DeepSeekだけでなくChatGPT/Gemini/Claudeも特定チャットURLを登録できる。

Webアプリへの自動投稿や回答の自動回収は行わない。
