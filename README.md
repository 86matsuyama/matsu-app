# マネジメント・リフレクション PWA

音声録音とAI分析によるマネジメント振り返り支援アプリケーションです。

## 機能

- **Google認証**: NextAuth.jsによるセキュアなGoogle OAuth認証
- **音声録音**: ブラウザ上で直接音声を録音・再生
- **AI分析**: Gemini 1.5 Flashによる全文文字起こしと分析
  - 【事実・感情・構造】のフレームワークを用いた分析
  - マネジメント視点でのフィードバック
- **自動保存**: Google Driveへの自動バックアップ
- **PWA対応**: モバイルデバイスにインストール可能

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS, Lucide React
- **認証**: NextAuth.js
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Storage**: Google Drive API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env.local`にコピーして、必要な値を設定してください。

```bash
cp .env.example .env.local
```

#### 必要な環境変数:

**NextAuth (Google OAuth)**
- `GOOGLE_CLIENT_ID`: Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
- `GOOGLE_CLIENT_SECRET`: 対応するクライアントシークレット
- `NEXTAUTH_SECRET`: ランダムな32文字以上の文字列 (例: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: アプリケーションのURL (開発時: `http://localhost:3000`)

**Gemini AI**
- `GEMINI_API_KEY`: [Google AI Studio](https://aistudio.google.com/app/apikey)でAPIキーを取得

**Google Drive API**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: サービスアカウントのメールアドレス
- `GOOGLE_PRIVATE_KEY`: サービスアカウントの秘密鍵
- `GOOGLE_DRIVE_FOLDER_ID`: 保存先フォルダのID

### 3. Google Cloud の設定

#### Google OAuth (NextAuth用)

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアントID」
3. アプリケーションの種類: Webアプリケーション
4. 承認済みのリダイレクトURI: `http://localhost:3000/api/auth/callback/google`
5. クライアントIDとシークレットを`.env.local`に設定

#### Google Drive API (サービスアカウント用)

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」→「Google Drive API」を有効化
2. 「認証情報」→「認証情報を作成」→「サービスアカウント」
3. サービスアカウントを作成し、JSONキーをダウンロード
4. JSONキーから`client_email`と`private_key`を取得して`.env.local`に設定
5. Google Driveで保存先フォルダを作成し、サービスアカウントのメールアドレスと共有
6. フォルダのIDを`.env.local`に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

```bash
npm run build
npm start
```

## ファイル命名規則

Google Driveに保存されるファイル名:
```
YYYY-MM-DD_{User_Name}_reflection.md
```

例: `2026-01-04_Matsuyama_reflection.md`

## プロジェクト構造

```
reflection-pwa/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth認証
│   │   │   ├── process-audio/       # AI音声処理
│   │   │   └── save-to-drive/       # Drive保存
│   │   ├── layout.tsx               # ルートレイアウト
│   │   ├── page.tsx                 # メインページ
│   │   └── globals.css              # グローバルスタイル
│   ├── components/
│   │   ├── VoiceRecorder.tsx        # 音声録音コンポーネント
│   │   └── SessionProvider.tsx      # セッション管理
│   └── lib/
│       ├── auth.ts                  # NextAuth設定
│       ├── drive.ts                 # Drive API設定
│       └── env.ts                   # 環境変数管理
├── public/
│   ├── manifest.json                # PWAマニフェスト
│   ├── icon-192.png                 # アプリアイコン
│   └── icon-512.png                 # アプリアイコン
└── .env.example                     # 環境変数テンプレート
```

## ライセンス

MIT
