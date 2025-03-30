"use client";

import React from 'react';

/**
 * フッターコンポーネント
 * アプリケーションのフッター部分を表示します
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PDF→Excel変換システム
            </p>
          </div>
          
          <div className="flex space-x-4">
            <a
              href="/docs/user-guide"
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              ユーザーガイド
            </a>
            <a
              href="/docs/developer-guide"
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              開発者ガイド
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
