"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";
import OcrEditor, { MappedFields } from "../components/OcrEditor";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { processMistralOcr } from "../action/mistral";
import Link from "next/link";

export default function MapPage() {
  const searchParams = useSearchParams();
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExcelGenerating, setIsExcelGenerating] = useState<boolean>(false);
  const [excelDownloadUrl, setExcelDownloadUrl] = useState<string | null>(null);

  // URLからPDFのURLを取得
  useEffect(() => {
    const pdfUrl = searchParams.get("url");
    if (pdfUrl) {
      fetchOcrResult(pdfUrl);
    }
  }, [searchParams]);

  // OCR結果を取得
  const fetchOcrResult = async (pdfUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await processMistralOcr(pdfUrl, true);
      setOcrResult(response);
    } catch (err) {
      console.error("OCR処理エラー:", err);
      setError(err instanceof Error ? err.message : "OCR処理中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  // マッピングデータを保存してExcelを生成
  const handleSaveMappedFields = async (mappedFields: MappedFields) => {
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
        throw new Error(`Excel生成エラー: ${response.status} ${response.statusText}`);
      }
      
      // Blobとしてレスポンスを取得
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setExcelDownloadUrl(url);
      
      // 自動ダウンロード
      const link = document.createElement("a");
      link.href = url;
      link.download = "履歴書.xlsx";
      link.click();
      
    } catch (err) {
      console.error("Excel生成エラー:", err);
      setError(err instanceof Error ? err.message : "Excel生成中にエラーが発生しました");
    } finally {
      setIsExcelGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentStep="map" onReset={() => window.location.href = "/"} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <h3 className="font-bold mb-2">エラーが発生しました</h3>
            <p>{error}</p>
          </div>
        )}
        
        {/* PDFのURLがない場合 */}
        {!searchParams.get("url") && !isLoading && !ocrResult && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">PDFが選択されていません</h2>
            <p className="mb-6 text-gray-600">
              PDFをアップロードしてOCR処理を行ってください。
            </p>
            <Link 
              href="/"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition-colors"
            >
              アップロードページへ戻る
            </Link>
          </div>
        )}
        
        {/* Excel生成成功時 */}
        {excelDownloadUrl && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-bold text-green-700 mb-2">Excel生成完了</h3>
            <p className="mb-2">Excelファイルの生成が完了しました。</p>
            <div className="flex space-x-4">
              <a
                href={excelDownloadUrl}
                download="履歴書.xlsx"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors"
              >
                再ダウンロード
              </a>
              <button
                onClick={() => window.location.href = "/"}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-sm transition-colors"
              >
                トップに戻る
              </button>
            </div>
          </div>
        )}
        
        {/* OCRエディター */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-200px)]">
          <OcrEditor 
            ocrResult={ocrResult} 
            onSave={handleSaveMappedFields} 
            isLoading={isLoading || isExcelGenerating}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
