"use client";

import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  isInitialUpload?: boolean;
  currentStep?: "upload" | "analyze" | "result";
  onReset?: () => void;
}

/**
 * ヘッダーコンポーネント
 * アプリケーションのヘッダー部分を表示します
 */
export default function Header({ isInitialUpload, currentStep, onReset }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-600 transition-colors">
            PDF→Excel変換
          </Link>
          
          {/* 現在のステップ表示 */}
          {currentStep && !isInitialUpload && (
            <div className="ml-6 flex items-center text-sm text-gray-500">
              <div className={`flex items-center ${currentStep === "upload" ? "text-orange-500 font-medium" : ""}`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                  currentStep === "upload" ? "bg-orange-500 text-white" : "bg-gray-200"
                } mr-1`}>1</span>
                <span>アップロード</span>
              </div>
              
              <svg className="w-4 h-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              
              <div className={`flex items-center ${currentStep === "analyze" ? "text-orange-500 font-medium" : ""}`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                  currentStep === "analyze" ? "bg-orange-500 text-white" : "bg-gray-200"
                } mr-1`}>2</span>
                <span>OCR処理</span>
              </div>
              
              <svg className="w-4 h-4 mx-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              
              <div className={`flex items-center ${currentStep === "result" ? "text-orange-500 font-medium" : ""}`}>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                  currentStep === "result" ? "bg-orange-500 text-white" : "bg-gray-200"
                } mr-1`}>3</span>
                <span>結果</span>
              </div>
            </div>
          )}
        </div>
        
        {/* リセットボタン */}
        {onReset && !isInitialUpload && (
          <button
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            新規アップロード
          </button>
        )}
      </div>
    </header>
  );
}
