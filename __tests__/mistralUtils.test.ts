import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextBlocksFromOcrResult, splitMarkdownIntoLines } from '../app/action/mistralUtils';

describe('mistralUtils', () => {
  describe('splitMarkdownIntoLines', () => {
    it('空の文字列を渡すと空の配列を返す', () => {
      expect(splitMarkdownIntoLines('')).toEqual([]);
    });

    it('nullを渡すと空の配列を返す', () => {
      expect(splitMarkdownIntoLines(null as any)).toEqual([]);
    });

    it('改行で文字列を分割する', () => {
      const markdown = '行1\n行2\n行3';
      expect(splitMarkdownIntoLines(markdown)).toEqual(['行1', '行2', '行3']);
    });

    it('空行をスキップする', () => {
      const markdown = '行1\n\n行2\n\n\n行3';
      expect(splitMarkdownIntoLines(markdown)).toEqual(['行1', '行2', '行3']);
    });

    it('前後の空白を削除する', () => {
      const markdown = ' 行1 \n 行2 \n 行3 ';
      expect(splitMarkdownIntoLines(markdown)).toEqual(['行1', '行2', '行3']);
    });
  });

  describe('extractTextBlocksFromOcrResult', () => {
    it('nullを渡すと空の配列を返す', () => {
      expect(extractTextBlocksFromOcrResult(null as any)).toEqual([]);
    });

    it('pagesがない場合は空の配列を返す', () => {
      expect(extractTextBlocksFromOcrResult({} as any)).toEqual([]);
    });

    it('pagesが空の配列の場合は空の配列を返す', () => {
      expect(extractTextBlocksFromOcrResult({ pages: [] } as any)).toEqual([]);
    });

    it('マークダウンからテキストブロックを抽出する', () => {
      const ocrResult = {
        pages: [
          {
            index: 0,
            markdown: '# ページ1\n\nテスト1\nテスト2'
          },
          {
            index: 1,
            markdown: '# ページ2\n\nテスト3\nテスト4'
          }
        ]
      };

      const expected = [
        { id: 0, text: '# ページ1', pageIndex: 0, lineIndex: 0 },
        { id: 2, text: 'テスト1', pageIndex: 0, lineIndex: 2 },
        { id: 3, text: 'テスト2', pageIndex: 0, lineIndex: 3 },
        { id: 1000, text: '# ページ2', pageIndex: 1, lineIndex: 0 },
        { id: 1002, text: 'テスト3', pageIndex: 1, lineIndex: 2 },
        { id: 1003, text: 'テスト4', pageIndex: 1, lineIndex: 3 }
      ];

      expect(extractTextBlocksFromOcrResult(ocrResult as any)).toEqual(expected);
    });

    it('markdownがないページはスキップする', () => {
      const ocrResult = {
        pages: [
          {
            index: 0,
            markdown: '# ページ1\n\nテスト1'
          },
          {
            index: 1
          }
        ]
      };

      const expected = [
        { id: 0, text: '# ページ1', pageIndex: 0, lineIndex: 0 },
        { id: 2, text: 'テスト1', pageIndex: 0, lineIndex: 2 }
      ];

      expect(extractTextBlocksFromOcrResult(ocrResult as any)).toEqual(expected);
    });
  });
});
