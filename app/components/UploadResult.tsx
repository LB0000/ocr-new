"use client";

import React from 'react';

interface UploadResultProps {
  uploadResult: {
    success: boolean;
    message: string;
    url?: string;
    fileType?: "pdf" | "image";
  };
  analyzing: boolean;
  onAnalyze: () => void;
}

/**
 * アップロード結果表示コンポーネント
 * ファイルアップロード結果を表示し、分析アクションを提供します
 */
export default function UploadResult({ uploadResult, analyzing, onAnalyze }: UploadResultProps) {
  if (!uploadResult) return null;

  // 成功時の表示
  if (uploadResult.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">アップロード成功</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>{uploadResult.message}</p>
            </div>
            {uploadResult.url && (
              <div className="mt-4">
                <button
                  onClick={onAnalyze}
                  disabled={analyzing}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                    analyzing ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                >
                  {analyzing ? '処理中...' : 'OCR処理を開始'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">アップロードエラー</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{uploadResult.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
