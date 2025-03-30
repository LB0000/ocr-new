"use server";

/**
 * Mistral AI OCR処理機能
 * 
 * このファイルはMistral AIのOCRサービスを利用してPDFやイメージファイルからテキストを抽出する
 * サーバーアクションを提供します。
 */

import { Mistral } from '@mistralai/mistralai';

// OCRResponseの型定義
export type OCRResponse = {
  pages: Array<{
    markdown?: string;
    // 他の必要なプロパティ
  }>;
  // 他の必要なプロパティ
};

// Mistral AI APIクライアントの初期化
const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
});

/**
 * PDFファイルをMistral AIのOCRで処理する
 * @param url 処理するPDFファイルのURL
 * @param includeMarkdown マークダウン形式のテキストを含めるかどうか（現在は無視されます）
 * @returns OCR処理結果
 */
export async function processMistralOcr(url: string, includeMarkdown: boolean = true): Promise<OCRResponse> {
  try {
    // Mistral AIのOCRを実行（URLを直接使用）
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: url
      }
      // マークダウンオプションは指定しない（型定義に存在しないため）
    });

    return ocrResponse as OCRResponse;
  } catch (error) {
    console.error('Mistral OCR error:', error);
    throw error;
  }
}

/**
 * 画像ファイルをMistral AIのOCRで処理する
 * @param url 処理する画像ファイルのURL
 * @param includeMarkdown マークダウン形式のテキストを含めるかどうか（現在は無視されます）
 * @returns OCR処理結果
 */
export async function processMistralImageOcr(url: string, includeMarkdown: boolean = true): Promise<OCRResponse> {
  try {
    // Mistral AIのOCRを実行（URLを直接使用）
    const ocrResponse = await mistralClient.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "image_url",
        imageUrl: url
      }
      // マークダウンオプションは指定しない（型定義に存在しないため）
    });

    return ocrResponse as OCRResponse;
  } catch (error) {
    console.error('Mistral Image OCR error:', error);
    throw error;
  }
}
