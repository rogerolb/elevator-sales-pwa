# 保存先・認証 v4.3

## 暫定標準
Supabaseをクラウド側の標準とする。

理由:
- Auth
- Postgres
- Storage
- Edge Functions
を1つにまとめられるため、個人用PWAでサーバーを自前運用しなくてよい。

## 保存方式
local-first。

1. 操作直後はlocalStorageへ保存
2. Supabaseログイン後、「今すぐクラウド保存」でuser_snapshotsへ同期
3. 端末変更時は「クラウドから復元」
4. JSONバックアップも残す

v4.3では自動同期ではなく手動同期。
同期競合ロジックを作る前に自動化しない。

## 認証
メールMagic Link / OTP。

ブラウザ:
- supabaseUrl
- publishable key
だけを設定。

秘密情報:
- secret/service-role
- OpenAI
- Google
- Japan Post等
はEdge Functionsの環境変数/Secretsへ。

## RLS
user_snapshotsはuser_id単位。
auth.uid() = user_id の行だけSELECT/INSERT/UPDATE/DELETE可能。

## OneDrive
将来「バックアップ先」として追加可能。
保存アダプターを分離したため、物件検索ロジック側は変更不要。
