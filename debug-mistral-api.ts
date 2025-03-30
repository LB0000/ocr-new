// debug-mistral-api.ts
import { Mistral } from '@mistralai/mistralai';

// ライブラリのバージョンを確認
console.log('@mistralai/mistralai version:', require('@mistralai/mistralai/package.json').version);

// OCR 関数の型を調査
const client = new Mistral({ apiKey: 'dummy' });
console.log('OCR process method:', Object.keys(client.ocr));

// サンプルリクエストを作成して型エラーを詳細に確認
try {
  const sampleRequest = {
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: "https://example.com/doc.pdf"
    }
    // includeMarkdown: true は意図的に削除
  };
  console.log('Sample request structure:', sampleRequest);
  
  // OCRRequestの型を出力
  type OCRRequestType = Parameters<typeof client.ocr.process>[0];
  console.log('OCRRequest type:', OCRRequestType);
} catch (e) {
  console.error('Error:', e);
}
