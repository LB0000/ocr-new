"use client";

import { FieldKey } from "../components/OcrEditor";

// フィールド推定のための正規表現パターン
const fieldPatterns: { [key in FieldKey]: RegExp[] } = {
  name: [
    /^(?:氏名|名前)[:：]?\s*(.+)$/i,
    /^(.+)\s*[（(][\p{Script=Hiragana}\p{Script=Katakana}ー]+[)）]$/u,
    /^[姓名氏][:：]?\s*(.+)$/i
  ],
  furigana: [
    /^(?:ふりがな|フリガナ)[:：]?\s*(.+)$/i,
    /^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u,
    /^[（(][\p{Script=Hiragana}\p{Script=Katakana}ー]+[)）]$/u
  ],
  birthday: [
    /(?:生年月日|誕生日)[:：]?\s*(.+)$/i,
    /^(\d{4}[年/-]\s*\d{1,2}[月/-]\s*\d{1,2}日?)(?:生|生まれ|出生)?/,
    /^(\d{1,2}[月/-]\s*\d{1,2}日?\s*\d{4}[年]?)(?:生|生まれ|出生)?/,
    /^.+\(\s*満\s*\d{1,2}\s*歳\s*\)/
  ],
  address: [
    /(?:住所|現住所)[:：]?\s*(.+)$/i,
    /^(?:〒\d{3}-\d{4})/,
    /^(?:\d{3}-\d{4})/,
    /^(?:東京都|北海道|大阪府|京都府|.+[都道府県])(?:.+[市区町村])(?:.+[0-9０-９]+)/
  ],
  phone: [
    /(?:電話|TEL|携帯|電話番号)[:：]?\s*(.+)$/i,
    /^(?:\d{2,4}-\d{2,4}-\d{3,4})$/,
    /^(?:\d{10,11})$/
  ],
  education: [
    /(?:学歴|学校|教育)[:：]?\s*(.+)$/i,
    /^(\d{4}[年/.]\d{1,2}[月/.])\s*(.+学校|.+大学|.+高校|.+中学|.+小学校)(?:.+)?(?:入学|卒業|修了|中退)/,
    /^(.+学校|.+大学|.+高校|.+中学|.+小学校)(?:.+)?(?:入学|卒業|修了|中退)/
  ],
  workHistory: [
    /(?:職歴|職務経歴|仕事)[:：]?\s*(.+)$/i,
    /^(\d{4}[年/.]\d{1,2}[月/.])\s*(.+会社|.+株式会社|.+有限会社|.+合同会社|.+社)(?:.+)?(?:入社|退社|就職|転職)/,
    /^(.+会社|.+株式会社|.+有限会社|.+合同会社|.+社)(?:.+)?(?:入社|退社|就職|転職)/
  ],
  licenses: [
    /(?:免許|資格|検定|スキル)[:：]?\s*(.+)$/i,
    /^(?:.+免許|.+資格|.+検定)(?:.+)?(?:取得|合格)/,
    /^(?:TOEIC|英検|日商簿記|宅建|FP|.+士)(?:.+)?(?:\d+点|\d+級|取得|合格)/
  ],
  selfPR: [
    /(?:自己PR|自己アピール|志望動機|特技|趣味)[:：]?\s*(.+)$/i,
    /^(?:私は|私の|わたしは|わたしの)(?:.+)/
  ],
  other: [
    // その他のパターンはデフォルトとして使用
  ]
};

// 信頼度スコアの閾値
const CONFIDENCE_THRESHOLD = 0.7;

/**
 * テキストからフィールドタイプを推定する
 * @param text 推定対象のテキスト
 * @returns 推定されたフィールドタイプと信頼度スコア
 */
export function predictFieldType(text: string): { fieldKey: FieldKey; confidence: number } {
  let bestMatch: { fieldKey: FieldKey; confidence: number } = { fieldKey: "other", confidence: 0 };
  
  // 各フィールドタイプのパターンでテキストをチェック
  Object.entries(fieldPatterns).forEach(([fieldKey, patterns]) => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // パターンにマッチした場合、信頼度スコアを計算
        // マッチの長さと元のテキストの長さの比率を考慮
        const matchLength = match[0].length;
        const textLength = text.length;
        const lengthRatio = matchLength / textLength;
        
        // 信頼度スコアの計算（パターンの特異性や一致度に基づく）
        let confidence = lengthRatio;
        
        // 特定のフィールドタイプに対する追加のヒューリスティック
        if (fieldKey === "name" && /^[一-龯々ぁ-んァ-ヶー]+\s+[一-龯々ぁ-んァ-ヶー]+$/.test(text)) {
          confidence += 0.2; // 日本語の姓名パターンに加点
        }
        
        if (fieldKey === "address" && /^(?:東京都|北海道|大阪府|京都府|.+[都道府県])/.test(text)) {
          confidence += 0.2; // 都道府県から始まる住所パターンに加点
        }
        
        if (fieldKey === "birthday" && /\d{4}[年/-]\d{1,2}[月/-]\d{1,2}/.test(text)) {
          confidence += 0.2; // 日付形式に加点
        }
        
        if (fieldKey === "phone" && /\d{2,4}-\d{2,4}-\d{3,4}/.test(text)) {
          confidence += 0.3; // 電話番号形式に加点
        }
        
        // 最大で1.0に制限
        confidence = Math.min(confidence, 1.0);
        
        // より高い信頼度のマッチがあれば更新
        if (confidence > bestMatch.confidence) {
          bestMatch = { fieldKey: fieldKey as FieldKey, confidence };
        }
      }
    }
  });
  
  return bestMatch;
}

/**
 * OCRブロックの配列からフィールドマッピングを自動推定する
 * @param blocks OCRブロックの配列
 * @returns 推定されたフィールドマッピング
 */
export function predictFieldMappings(blocks: { id: number; text: string }[]): { [blockId: number]: FieldKey } {
  const mappings: { [blockId: number]: FieldKey } = {};
  
  blocks.forEach(block => {
    const { fieldKey, confidence } = predictFieldType(block.text);
    
    // 信頼度が閾値を超える場合のみマッピングを適用
    if (confidence >= CONFIDENCE_THRESHOLD) {
      mappings[block.id] = fieldKey;
    }
  });
  
  return mappings;
}

/**
 * 推定結果の信頼度に基づいてフィールドマッピングを並べ替える
 * @param blocks OCRブロックの配列
 * @returns 信頼度でソートされたフィールド推定結果
 */
export function getSortedPredictions(blocks: { id: number; text: string }[]): { blockId: number; fieldKey: FieldKey; confidence: number; text: string }[] {
  const predictions = blocks.map(block => {
    const { fieldKey, confidence } = predictFieldType(block.text);
    return {
      blockId: block.id,
      fieldKey,
      confidence,
      text: block.text
    };
  });
  
  // 信頼度の高い順にソート
  return predictions.sort((a, b) => b.confidence - a.confidence);
}
