# Web補強一般化 v2.7

## 検索順
保存物件 → Web補強キャッシュ → 内部確認 → 公開地図 → クラウドWeb補強API

## 改善点
Web補強済み物件は③検索のローカル候補として直接表示する。
そのため外部検索が遮断されても、ダイナシティなど補強済み物件は候補→営業判断→推計まで動作する。

## 共通補強データ
buildingName / aliases / addressContains / use / area / floors / height /
completionYear / blocks / owner / operator / currentMaintainer / sources[]

新たに調査・確認した物件を同じ形式で追加できる。

## 任意物件の自動Web補強
静的HTMLから任意サイトを直接巡回するのはCORS・認証・安全上の制約がある。
本番では `/api/enrich-property` のサーバーレスAPIを接続し、
建物名・住所から公式Web情報を取得して共通補強形式で返す。
