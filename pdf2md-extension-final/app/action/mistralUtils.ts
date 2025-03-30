"use server";

import { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";
import { OCRPageObject } from "@mistralai/mistralai/src/models/components/ocrpageobject.js";

/**
 * OCRブロックの型定義
 */
export interface OCRTextBlock {
  id: number;
  text: string;
  pageIndex: number;
  lineIndex: number;
}

/**
 * Mistral OCR結果からテキストブロックの配列を抽出する
 * 
 * @param ocrResult Mistral OCRのレスポンス
 * @returns テキストブロックの配列
 */
export function extractTextBlocksFromOcrResult(ocrResult: OCRResponse): OCRTextBlock[] {
  if (!ocrResult || !ocrResult.pages || ocrResult.pages.length === 0) {
    return [];
  }

  const textBlocks: OCRTextBlock[] = [];
  
  // 各ページのマークダウンを行に分割
  ocrResult.pages.forEach((page: OCRPageObject, pageIndex: number) => {
    if (page.markdown) {
      const lines = page.markdown.split("\n");
      
      lines.forEach((line: string, lineIndex: number) => {
        // 空行をスキップ
        if (line.trim()) {
          textBlocks.push({
            id: pageIndex * 1000 + lineIndex, // ユニークIDを生成
            text: line.trim(),
            pageIndex,
            lineIndex
          });
        }
      });
    }
  });
  
  return textBlocks;
}

/**
 * マークダウンテキストを行単位で分割する
 * 
 * @param markdown マークダウンテキスト
 * @returns 行の配列（空行を除く）
 */
export function splitMarkdownIntoLines(markdown: string): string[] {
  if (!markdown) return [];
  
  return markdown
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * OCR結果からページごとのマークダウンを抽出する
 * 
 * @param ocrResult Mistral OCRのレスポンス
 * @returns ページごとのマークダウンの配列
 */
export function extractMarkdownByPage(ocrResult: OCRResponse): string[] {
  if (!ocrResult || !ocrResult.pages || ocrResult.pages.length === 0) {
    return [];
  }
  
  return ocrResult.pages
    .map(page => page.markdown || "")
    .filter(markdown => markdown.trim().length > 0);
}

/**
 * OCR結果から全てのマークダウンを結合して取得する
 * 
 * @param ocrResult Mistral OCRのレスポンス
 * @returns 結合されたマークダウン
 */
export function getCombinedMarkdown(ocrResult: OCRResponse): string {
  if (!ocrResult || !ocrResult.pages || ocrResult.pages.length === 0) {
    return "";
  }
  
  return ocrResult.pages
    .map(page => page.markdown || "")
    .join("\n\n");
}
