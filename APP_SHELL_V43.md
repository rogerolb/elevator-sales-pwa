# 営業アプリ箱 v4.3

v4.2の管理整理・クロスリンク・API境界に加え、
保存・認証・サーバレスの土台を追加。

追加:
- Supabaseクラウド設定
- メールMagic Linkログイン
- local-firstスナップショット同期
- クラウド復元
- JSON端末バックアップ
- user_snapshots + RLS SQL
- Edge Functions雛形6本
- Secrets分離
- HOMEの保存モード表示

本番Supabase情報が未設定なら、従来どおり端末保存だけで動作する。
