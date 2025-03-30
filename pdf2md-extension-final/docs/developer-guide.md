# PDF→Excel 履歴書変換システム - 開発者ドキュメント

## アーキテクチャ概要

このシステムは、既存のPDF→Markdown変換システムを拡張し、履歴書PDFをOCRしてExcelテンプレートに転記する機能を追加しています。

### コンポーネント構成

```
app/
├── action/
│   ├── mistral.ts        # 既存: OCR処理用サーバーアクション
│   ├── storage.ts        # 既存: Vercel Blob操作用サーバーアクション
│   ├── mistralUtils.ts   # 新規: OCR結果のテキストブロック抽出ユーティリティ
│   └── excelGen.ts       # 新規: Excel生成サーバーアクション
├── components/
│   ├── OcrResultView.tsx # 既存: OCR結果表示コンポーネント
│   ├── OcrEditor.tsx     # 新規: OCRマッピング編集コンポーネント
│   ├── PresetManager.tsx # 新規: プリセット管理コンポーネント
│   ├── AutoMappingControl.tsx # 新規: 自動マッピングコントロール
│   └── ExcelPreview.tsx  # 新規: Excel出力プレビューコンポーネント
├── hooks/
│   └── usePresets.ts     # 新規: プリセット管理用カスタムフック
├── utils/
│   └── fieldPrediction.ts # 新規: フィールド推定ユーティリティ
├── styles/
│   └── excelPreview.css  # 新規: Excelプレビュー用スタイル
├── page.tsx              # 既存: トップページ（アップロード画面）
└── map/
    └── page.tsx          # 新規: マッピングページ
```

### データフロー

1. **PDFアップロード**: ユーザーがPDFをアップロード → Vercel Blobに保存
2. **OCR処理**: Mistral AI OCRでPDFをテキスト化
3. **テキストブロック抽出**: OCR結果からテキストブロックを抽出
4. **マッピング**: ユーザーが各ブロックをフィールドにマッピング（自動/手動）
5. **Excel生成**: マッピングデータをExcelテンプレートに書き込み
6. **ダウンロード**: 生成されたExcelファイルをユーザーに提供

## 主要コンポーネント詳細

### 1. OcrEditor.tsx

OCR結果の表示、フィールドマッピング、テキスト編集機能を提供するメインコンポーネント。

**主要機能**:
- OCR結果の行/ブロック表示
- フィールド選択UI
- テキスト編集機能
- 複数行選択・結合機能
- マッピング結果プレビュー
- プリセット管理との連携
- 自動マッピングとの連携
- Excelプレビューとの連携

### 2. usePresets.ts

マッピングプリセットを管理するためのReactカスタムフック。

**主要機能**:
- プリセットの保存
- プリセットの読み込み
- プリセットの削除
- ローカルストレージとの連携

### 3. fieldPrediction.ts

テキストからフィールドタイプを推定するユーティリティ。

**主要機能**:
- 正規表現パターンによるフィールド推定
- 信頼度スコアリング
- 複数行のマッピング推定

### 4. excelGen.ts

マッピングデータをExcelテンプレートに書き込むサーバーアクション。

**主要機能**:
- Excelテンプレート読み込み
- フィールドデータのセル書き込み
- Excelバイナリ生成
- ダウンロード用レスポンス生成

## 拡張ポイント

### 1. 複数テンプレート対応

`excelGen.ts`を拡張し、複数のテンプレートをサポート:

```typescript
// テンプレート定義
const templates = {
  standard: {
    path: "履歴書_template.xlsx",
    mappings: { name: "B3", furigana: "B2", ... }
  },
  company1: {
    path: "company1_template.xlsx",
    mappings: { name: "C4", furigana: "C3", ... }
  },
  // 他のテンプレート...
};

// テンプレート選択パラメータを追加
export async function POST(request: NextRequest) {
  const data = await request.json();
  const templateKey = data.template || "standard";
  const template = templates[templateKey];
  // ...
}
```

### 2. AI自動フィールド推定の精度向上

`fieldPrediction.ts`を拡張し、機械学習モデルを統合:

```typescript
// 機械学習モデルによる推定（将来的な実装）
async function predictWithML(text: string): Promise<{ fieldKey: FieldKey; confidence: number }> {
  // 外部APIまたはローカルモデルを呼び出し
  const response = await fetch('/api/ml-predict', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return await response.json();
}

// 既存の正規表現ベースの推定と組み合わせる
export async function predictFieldTypeEnhanced(text: string): Promise<{ fieldKey: FieldKey; confidence: number }> {
  const regexPrediction = predictFieldType(text);
  
  if (regexPrediction.confidence > 0.8) {
    return regexPrediction; // 高信頼度の場合は正規表現の結果を使用
  }
  
  try {
    const mlPrediction = await predictWithML(text);
    // 両方の結果を組み合わせるロジック
    return mlPrediction.confidence > regexPrediction.confidence 
      ? mlPrediction 
      : regexPrediction;
  } catch (error) {
    console.error('ML予測エラー:', error);
    return regexPrediction; // エラー時はフォールバック
  }
}
```

### 3. 複数PDFの一括処理

新しいページとコンポーネントを追加:

```typescript
// app/batch/page.tsx
"use client";

import { useState } from "react";
import BatchUploader from "../components/BatchUploader";
import BatchProcessor from "../components/BatchProcessor";

export default function BatchPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">一括処理</h1>
      
      <BatchUploader onUploadComplete={setUploadedFiles} />
      
      {uploadedFiles.length > 0 && (
        <BatchProcessor files={uploadedFiles} />
      )}
    </div>
  );
}
```

## テスト戦略

1. **ユニットテスト**:
   - `fieldPrediction.ts`: 様々なテキストパターンでの推定精度
   - `usePresets.ts`: プリセットの保存・読み込み・削除
   - `ExcelPreview.tsx`: 表示モードの切り替え、空状態の処理

2. **統合テスト**:
   - OCR結果からExcel生成までの一連のフロー
   - エラーケースの処理（テンプレート不在、無効なマッピングなど）

3. **E2Eテスト**:
   - 実際のPDFアップロードからExcelダウンロードまでの一連の操作

## パフォーマンス最適化

1. **React最適化**:
   - `useCallback`と`useMemo`を使用して不要な再レンダリングを防止
   - 大きなコンポーネントの分割と遅延ロード

2. **Excel生成の最適化**:
   - 大きなテンプレートの場合はストリーミング処理を検討
   - バックグラウンドジョブでの処理（大量のファイル処理時）

## セキュリティ考慮事項

1. **入力検証**:
   - クライアント側とサーバー側の両方で入力を検証
   - 特にExcel生成時のフィールドキーの検証

2. **ファイル処理**:
   - アップロードされるPDFのサイズと種類の制限
   - テンプレートファイルへのアクセス制御

3. **データ保護**:
   - 処理後のPDFとExcelの適切な削除
   - 機密情報の適切な取り扱い

## デプロイメント

1. **環境変数**:
   - `MISTRAL_API_KEY`: Mistral AI OCR APIキー
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob用トークン

2. **ビルドプロセス**:
   ```bash
   npm install
   npm run build
   ```

3. **Vercelへのデプロイ**:
   ```bash
   vercel --prod
   ```

## トラブルシューティング

1. **Excel生成エラー**:
   - テンプレートファイルの存在確認
   - セルアドレスの有効性確認
   - exceljs依存関係の確認

2. **OCR処理エラー**:
   - Mistral API接続の確認
   - PDFファイルの有効性確認
   - API制限の確認

3. **プリセット保存エラー**:
   - ローカルストレージの容量確認
   - ブラウザのプライバシー設定確認
