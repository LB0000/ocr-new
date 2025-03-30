"use client";

import React from 'react';
import { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";

interface OcrResultViewProps {
  ocrResult: OCRResponse | { success: false; error: string } | null;
  analyzing: boolean;
}

/**
 * OCR結果表示コンポーネント
 * OCR処理の結果を表示するためのコンポーネントです
 */
export default function OcrResultView({ ocrResult, analyzing }: OcrResultViewProps) {
  // エラーの場合
  if (ocrResult && 'success' in ocrResult && !ocrResult.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold text-red-700 mb-2">エラーが発生しました</h3>
        <p className="text-red-600">{ocrResult.error}</p>
      </div>
    );
  }

  // 処理中の場合
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-lg font-medium">OCR処理中...</p>
      </div>
    );
  }

  // OCR結果がない場合
  if (!ocrResult || !('pages' in ocrResult) || !ocrResult.pages) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-700">OCR結果がありません。ファイルをアップロードして処理してください。</p>
      </div>
    );
  }

  // OCR結果の表示
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">OCR結果</h2>
      
      {ocrResult.pages.map((page, pageIndex) => (
        <div key={pageIndex} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">ページ {pageIndex + 1}</h3>
          
          {page.markdown ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-96">
                {page.markdown}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">このページにはテキストが検出されませんでした。</p>
          )}
        </div>
      ))}
    </div>
  );
}
