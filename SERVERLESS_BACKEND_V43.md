# サーバレスバックエンド雛形 v4.3

supabase/functions:
- health
- ai
- news
- photo-identify
- enrich-property
- analyze-facility-map

v4.3では外部API呼び出しをまだ実装せず、接続口だけ固定。

## 原則
- Edge Functionsは短時間・冪等な処理向け
- 秘密情報はDeno.env.get(...)で取得
- .envをGitへコミットしない
- health以外は認証必須
- AI/ニュース/写真/Google等は次版以降に個別接続

## ブラウザからの呼出
app_config.jsへEdge Function URLを設定すると
v4.2で作成済みのAPI境界がそのまま有効になる。
