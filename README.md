# PDF→Excel 履歴書転記機能 拡張ガイド

## 概要
このプロジェクトは、既存のPDF→Markdown変換システムに「履歴書PDFをOCRし、Excelテンプレートに転記」する機能を追加した拡張実装です。PDFをOCRした結果を手動マッピング→Excelテンプレートに書き込み→ダウンロードの流れを提供します。

## 機能
- PDFアップロード（既存機能を活用）
- Mistral AI OCRによるテキスト抽出（既存機能を活用）
- OCR結果の行/ブロック一覧表示
- 各行を「氏名」「住所」「生年月日」など必要フィールドに手動マッピング
- マッピングしたデータをExcelテンプレートに転記
- 完成したExcelファイルのダウンロード

## 必要要件
- Node.js 18.x以上
- Next.js 13 (App Router)
- Mistral AI OCR API
- Vercel Blob Storage
- exceljs (Excel操作用ライブラリ)

## セットアップ手順

### 1. 環境変数の設定
`.env.local`ファイルに以下の環境変数を設定してください：

```
MISTRAL_API_KEY=your_mistral_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 2. 依存パッケージのインストール
```bash
npm install exceljs
# または
yarn add exceljs
```

### 3. Excelテンプレートの配置
`templates/履歴書_template.xlsx`にExcelテンプレートを配置してください。
テンプレートには以下のセル位置が定義されています：

- 氏名: B3
- ふりがな: B2
- 生年月日: B5
- 住所: B7
- 電話番号: F6
- 学歴: C13
- 職歴: C20
- 免許・資格: C26
- 自己PR: C30
- その他: C34

### 4. 開発サーバーの起動
```bash
npm run dev
# または
yarn dev
```

## 使用方法

### 1. PDFアップロード
1. トップページ（`/`）にアクセスします
2. PDFファイルをドラッグ＆ドロップするか、「Select File」ボタンをクリックしてPDFを選択します
3. PDFがアップロードされ、OCR処理が自動的に開始されます

### 2. OCR結果の確認とマッピング
1. OCR処理が完了したら、「Excelマッピング画面へ進む」ボタンをクリックします
2. マッピング画面（`/map`）に遷移し、OCR結果の各行が表示されます
3. 各行の右側のプルダウンメニューから適切なフィールド（氏名、住所など）を選択します
4. 必要に応じてテキストを編集できます
5. 複数行を選択して結合することも可能です（例：学歴や職歴の複数行）

### 3. Excel出力
1. マッピングが完了したら、「Excelに出力」ボタンをクリックします
2. Excelファイルが自動的に生成され、ダウンロードが開始されます
3. ダウンロードが完了したら、Excelファイルを開いて内容を確認します

## ファイル構成
```
/app
  /action
    mistral.ts        - 既存のOCR処理機能
    mistralUtils.ts   - OCR結果からテキストブロックを抽出する機能（新規）
    storage.ts        - 既存のVercel Blob操作機能
    excelGen.ts       - Excel生成機能（新規）
  /components
    OcrEditor.tsx     - OCR結果マッピングUI（新規）
    OcrResultView.tsx - 既存のOCR結果表示コンポーネント
    Header.tsx        - 既存のヘッダーコンポーネント
    Footer.tsx        - 既存のフッターコンポーネント
  /map
    page.tsx          - マッピング画面（新規）
  page.tsx            - トップページ（既存、マッピング画面へのボタン追加）
/templates
  履歴書_template.xlsx - Excel出力用テンプレート（新規）
/__tests__
  mistralUtils.test.ts - ユーティリティ関数のテスト（新規）
```

## 実装上の注意点

### 型安全性
- FieldKey型を使用して、マッピング可能なフィールドを明示的に定義しています
- MappedFieldsインターフェースは`[key in FieldKey]?: string`と定義し、型安全性を確保しています
- excelGen.tsでは`isValidFieldKey`関数を使用して、受け取ったフィールドキーの検証を行っています

### エラーハンドリング
- テンプレートファイルの存在確認を行い、ファイルが見つからない場合は適切なエラーメッセージを返します
- OCR処理やExcel生成時のエラーを適切にキャッチし、ユーザーに通知します
- マッピングが空の場合は「Excelに出力」ボタンを無効化し、無効な操作を防止します

### 状態管理
- React Hooksを適切に使用し、状態更新の非同期性を考慮した実装になっています
- useEffectとuseCallbackを使用して、状態変更時に自動的にマッピング結果が更新されるようにしています

## 拡張ポイント
- **自動フィールド抽出**: 将来的にNER(Named Entity Recognition)モデルを使って「自動で住所や生年月日を判定」する機能を追加できます
- **複数テンプレート対応**: 企業ごとに異なるExcelテンプレートを切り替える機能を追加できます
- **マッピングプリセット**: よく使うマッピングパターンを保存・再利用する機能を追加できます

## トラブルシューティング
- **PDFアップロードエラー**: ファイルサイズが20MB以下であることを確認してください
- **OCR処理エラー**: Mistral API Keyが正しく設定されていることを確認してください
- **Excel生成エラー**: テンプレートファイルが正しく配置されていることを確認してください
- **テンプレートファイルエラー**: `templates`ディレクトリが存在し、その中に`履歴書_template.xlsx`が配置されていることを確認してください

## ライセンス
このプロジェクトは元のPDF→Markdownシステムと同じライセンスに従います。
