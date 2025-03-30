"use client";

import { useState } from "react";
import { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";
import { MappedFields } from "../components/OcrEditor";
import OcrEditor from "../components/OcrEditor";

interface MapPageProps {
  searchParams: {
    blobUrl?: string;
  };
}

export default function MapPage({ searchParams }: MapPageProps) {
  const { blobUrl } = searchParams;
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExcelGenerating, setIsExcelGenerating] = useState<boolean>(false);
  const [excelDownloadUrl, setExcelDownloadUrl] = useState<string | null>(null);

  // PDFのURLからOCR結果を取得
  const fetchOcrResult = async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/action/mistral?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`OCR処理に失敗しました: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOcrResult(data);
    } catch (err) {
      console.error("OCR取得エラー:", err);
      setError(err instanceof Error ? err.message : "OCR処理中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // マッピングされたフィールドからExcelを生成
  const handleGenerateExcel = async (mappedFields: MappedFields) => {
    setIsExcelGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/action/excelGen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: mappedFields }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Excel生成に失敗しました: ${response.statusText}`);
      }
      
      // レスポンスをBlobに変換
      const blob = await response.blob();
      
      // ダウンロードURLを作成
      const url = URL.createObjectURL(blob);
      setExcelDownloadUrl(url);
      
      // 自動ダウンロード
      const link = document.createElement("a");
      link.href = url;
      link.download = `履歴書_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Excel生成エラー:", err);
      setError(err instanceof Error ? err.message : "Excel生成中にエラーが発生しました");
    } finally {
      setIsExcelGenerating(false);
    }
  };

  // blobUrlが変更されたらOCR結果を取得
  useState(() => {
    if (blobUrl) {
      fetchOcrResult(blobUrl);
    }
  });

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">履歴書マッピング</h1>
        <p className="text-gray-600">
          OCR結果を確認し、各フィールドを履歴書テンプレートにマッピングします
        </p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p>{error}</p>
        </div>
      )}

      {!blobUrl && (
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
          <p>PDFファイルがアップロードされていません。</p>
          <a
            href="/"
            className="mt-2 inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            アップロード画面に戻る
          </a>
        </div>
      )}

      {isExcelGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center">
              <svg
                className="animate-spin h-8 w-8 text-orange-500 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-lg font-medium">Excelファイルを生成中...</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <OcrEditor
          ocrResult={ocrResult}
          onSave={handleGenerateExcel}
          isLoading={isLoading}
        />
      </div>

      <footer className="mt-6 text-center text-gray-500 text-sm">
        <p>PDF→Excel変換システム © 2025</p>
      </footer>
    </div>
  );
}
