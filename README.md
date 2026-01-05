# 塾向け出欠管理 Web アプリ

TypeScript/React と Node.js(Express) + SQLite を使った出欠管理アプリです。学生・授業の登録と出欠記録、簡易集計ができます。

## 構成
- `backend`: Express + SQLite3 の API サーバー
- `frontend`: Vite + React の SPA フロントエンド
- ルート `package.json` でワークスペースをまとめています

## セットアップ
1. 依存関係をインストール
   ```bash
   npm install --workspaces
   ```
2. API サーバーを起動（デフォルト: http://localhost:4000）
   ```bash
   npm run dev:backend
   ```
3. フロントエンドを起動（デフォルト: http://localhost:5173）
   ```bash
   npm run dev:frontend
   ```
4. `frontend/.env` に `VITE_API_URL` を設定すれば API の URL を変更できます。

## ローカル動作確認の流れ
1. 上記セットアップでバックエンド・フロントエンドをそれぞれ別ターミナルで起動する。
2. ブラウザで `http://localhost:5173` を開き、以下の順にフォームを操作する。
   - 「学生を登録」に名前を入力して登録。
   - 「授業を登録」に授業名と日付を入力して登録。
   - 「出欠を入力」で授業・学生を選び、出欠ステータス（出席/欠席/遅刻）を保存。
3. 画面下部の「集計」カードに、授業ごとの出席・欠席・遅刻の件数が反映されることを確認する。
4. API の挙動だけ確認したい場合は、バックエンドのみ起動し `curl http://localhost:4000/api/sessions` などでレスポンスを確認できる。

## 本番公開のヒント
- SQLite は `backend/data/attendance.db` に保存されます。永続ボリュームをマウントしてください。
- それぞれ `npm run build` でビルドできます。API は `npm run start` で起動します。
- 逆プロキシ（例: nginx）で `/api` を 4000 番ポートに、フロントの静的ファイルを配信する構成が簡単です。

## テスト
API は Vitest + Supertest で簡易 E2E テストを用意しています。
```bash
npm test
```
