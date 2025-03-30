import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictFieldType, predictFieldMappings } from '../app/utils/fieldPrediction';

describe('fieldPrediction', () => {
  describe('predictFieldType', () => {
    it('should correctly identify name fields', () => {
      const nameTexts = [
        '氏名: 山田 太郎',
        '名前：佐藤 花子',
        '山田 太郎（やまだ たろう）',
        '姓名: 鈴木 一郎'
      ];
      
      nameTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('name');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify furigana fields', () => {
      const furiganaTexts = [
        'ふりがな: やまだ たろう',
        'フリガナ：サトウ ハナコ',
        'やまだ たろう',
        '（すずき いちろう）'
      ];
      
      furiganaTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('furigana');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify birthday fields', () => {
      const birthdayTexts = [
        '生年月日: 1990年5月10日',
        '誕生日：1985/12/24',
        '1990年5月10日生',
        '1990年5月10日生まれ（満33歳）'
      ];
      
      birthdayTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('birthday');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify address fields', () => {
      const addressTexts = [
        '住所: 東京都新宿区西新宿2-8-1',
        '現住所：大阪府大阪市北区梅田1-1-3',
        '〒160-0023 東京都新宿区西新宿2-8-1',
        '東京都新宿区西新宿2-8-1'
      ];
      
      addressTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('address');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify phone fields', () => {
      const phoneTexts = [
        '電話: 03-1234-5678',
        'TEL：090-1234-5678',
        '携帯: 08012345678',
        '電話番号: 03-1234-5678'
      ];
      
      phoneTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('phone');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify education fields', () => {
      const educationTexts = [
        '学歴: 2009年4月 東京大学入学',
        '学校：2013年3月 東京大学卒業',
        '2009年4月 東京大学入学',
        '東京大学文学部卒業'
      ];
      
      educationTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('education');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify work history fields', () => {
      const workHistoryTexts = [
        '職歴: 2013年4月 株式会社ABC入社',
        '職務経歴：2018年3月 株式会社XYZ退社',
        '2013年4月 株式会社ABC入社',
        '株式会社DEF営業部配属'
      ];
      
      workHistoryTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('workHistory');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify licenses fields', () => {
      const licensesTexts = [
        '免許: 普通自動車第一種運転免許',
        '資格：TOEIC 850点',
        '日商簿記2級取得',
        '英検準1級合格'
      ];
      
      licensesTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('licenses');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should correctly identify selfPR fields', () => {
      const selfPRTexts = [
        '自己PR: 私は...',
        '自己アピール：私の強みは...',
        '志望動機: 貴社の理念に共感し...',
        '私は前職で培った経験を活かし...'
      ];
      
      selfPRTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('selfPR');
        expect(result.confidence).toBeGreaterThan(0.7);
      });
    });

    it('should return "other" for unrecognized text', () => {
      const otherTexts = [
        'これは特に意味のないテキストです',
        '12345',
        '-----',
        'Lorem ipsum dolor sit amet'
      ];
      
      otherTexts.forEach(text => {
        const result = predictFieldType(text);
        expect(result.fieldKey).toBe('other');
        expect(result.confidence).toBeLessThan(0.7);
      });
    });
  });

  describe('predictFieldMappings', () => {
    it('should map blocks with confidence above threshold', () => {
      const blocks = [
        { id: 1, text: '氏名: 山田 太郎' },
        { id: 2, text: 'フリガナ: ヤマダ タロウ' },
        { id: 3, text: '生年月日: 1990年5月10日' },
        { id: 4, text: 'これは特に意味のないテキストです' }
      ];
      
      const mappings = predictFieldMappings(blocks);
      
      expect(mappings[1]).toBe('name');
      expect(mappings[2]).toBe('furigana');
      expect(mappings[3]).toBe('birthday');
      expect(mappings[4]).toBeUndefined();
    });
  });
});
