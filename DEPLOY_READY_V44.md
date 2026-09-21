# 本番設定・接続診断 v4.4

## v4.4で追加したもの

### 初期設定ウィザード
setup_v44.html

入力:
- Supabase Project URL
- publishable key
- 本番PWA URL

生成:
- app_config.js

secret keyや外部APIキーは入力しない。

### 接続診断
connection_check_v44.html

確認:
1. Supabase設定
2. Authログイン状態
3. user_snapshots + RLS
4. health Edge Function

### Edge Function認証
cloud_adapter.jsのinvokeFunctionで、
publishable keyをapikeyに、
ログイン中のaccess tokenをAuthorizationに付与する。

healthのみ公開。
その他Functionsはverify_jwt=true。

### RLSテスト
supabase/tests/user_snapshots_rls.test.sql

supabase test db で、
- テーブル存在
- RLS有効
- 4操作ポリシー
- anon SELECT不可
を確認。

### GitHub Actions
- deploy-pages.yml
- deploy-supabase.yml

PWAはGitHub Pagesへ静的配置可能。
Supabase側はmigration + Edge Functionsを手動実行のworkflowで配置。

## まだ必要なユーザー操作
1. Supabaseアカウント/プロジェクト作成
2. URL/publishable key取得
3. Auth Site URL/Redirect URLs設定
4. GitHubを使う場合はRepository Secrets登録
5. 外部API接続時にSupabase Secrets登録

ここはアカウント固有なので自動では埋めていない。
