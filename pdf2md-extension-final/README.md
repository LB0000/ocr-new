# PDF→Excel 履歴書変換システム

## 概要

このシステムは、既存のPDF→Markdown変換アプリケーションを拡張し、履歴書PDFをOCRしてExcelテンプレートに転記する機能を追加したものです。

## 主な機能

1. **PDFアップロードとOCR処理**
   - PDFファイルをアップロードし、Mistral AI OCRでテキスト抽出

2. **マッピングプリセット機能**
   - よく使う履歴書フォーマットごとにマッピングパターンを保存・再利用
   - ローカルストレージを使用したプリセット管理

3. **AI自動フィールド推定機能**
   - OCR結果の各行を分析し、「氏名」「住所」などを自動推定
   - 信頼度スコアリングと閾値調整機能

4. **Excel出力プレビュー機能**
   - マッピングされたデータがExcelのどのセルに配置されるかを視覚化
   - 簡易表示と詳細表示の2つのモード

5. **Excel生成とダウンロード**
   - マッピングデータをExcelテンプレートに書き込み
   - 生成されたExcelファイルのダウンロード

## セットアップ方法

### 必要要件

- Node.js 18.0.0以上
- npm 9.0.0以上

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>

# 依存関係のインストール
npm install
```

### 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
MISTRAL_API_KEY=your_mistral_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルドと本番環境での実行

```bash
npm run build
npm start
```

## 使用方法

詳細な使用方法については、[ユーザーガイド](./docs/user-guide.md)を参照してください。

## 開発者向け情報

開発者向けの詳細情報については、[開発者ガイド](./docs/developer-guide.md)を参照してください。

## テスト

```bash
npm test
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 謝辞

- Mistral AI - OCR処理
- ExcelJS - Excel生成
- Vercel - ホスティングとBlobストレージ
