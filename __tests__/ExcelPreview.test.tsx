import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExcelPreview from '../app/components/ExcelPreview';
import { MappedFields } from '../app/components/OcrEditor';

describe('ExcelPreview', () => {
  const sampleMappedFields: MappedFields = {
    name: '山田 太郎',
    furigana: 'やまだ たろう',
    birthday: '1990年5月10日生（満33歳）',
    address: '東京都新宿区西新宿2-8-1',
    phone: '090-1234-5678',
    education: '2009年4月 東京大学入学\n2013年3月 東京大学卒業',
    workHistory: '2013年4月 株式会社ABC入社\n2018年3月 株式会社XYZ退社',
    licenses: '普通自動車第一種運転免許\nTOEIC 850点',
    selfPR: '私は前職で培った経験を活かし、貴社の発展に貢献したいと考えております。',
  };

  it('should render simple preview by default', () => {
    render(<ExcelPreview mappedFields={sampleMappedFields} />);
    
    // 簡易表示モードのタイトルが表示されていることを確認
    expect(screen.getByText('マッピング概要')).toBeInTheDocument();
    
    // 各フィールドが表示されていることを確認
    expect(screen.getByText('氏名')).toBeInTheDocument();
    expect(screen.getByText('ふりがな')).toBeInTheDocument();
    expect(screen.getByText('生年月日')).toBeInTheDocument();
    expect(screen.getByText('住所')).toBeInTheDocument();
    expect(screen.getByText('電話番号')).toBeInTheDocument();
    
    // 各フィールドの値が表示されていることを確認
    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('やまだ たろう')).toBeInTheDocument();
    expect(screen.getByText('1990年5月10日生（満33歳）')).toBeInTheDocument();
    expect(screen.getByText('東京都新宿区西新宿2-8-1')).toBeInTheDocument();
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument();
    
    // セル位置が表示されていることを確認
    expect(screen.getByText('B3')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('B5')).toBeInTheDocument();
    expect(screen.getByText('B7')).toBeInTheDocument();
    expect(screen.getByText('F6')).toBeInTheDocument();
  });

  it('should toggle between simple and detailed preview', () => {
    render(<ExcelPreview mappedFields={sampleMappedFields} />);
    
    // 初期状態では簡易表示
    expect(screen.getByText('マッピング概要')).toBeInTheDocument();
    
    // 詳細表示に切り替えるボタンをクリック
    fireEvent.click(screen.getByText('詳細表示に切り替え'));
    
    // 詳細表示モードのタイトルが表示されていることを確認
    expect(screen.getByText('履歴書_template.xlsx')).toBeInTheDocument();
    
    // Excelのセル位置が表示されていることを確認（A, B, C, ...）
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    
    // 簡易表示に戻すボタンをクリック
    fireEvent.click(screen.getByText('簡易表示に切り替え'));
    
    // 簡易表示モードのタイトルが表示されていることを確認
    expect(screen.getByText('マッピング概要')).toBeInTheDocument();
  });

  it('should display empty state message when no fields are mapped', () => {
    render(<ExcelPreview mappedFields={{}} />);
    
    // 空の状態メッセージが表示されていることを確認
    expect(screen.getByText('マッピングされたフィールドがありません')).toBeInTheDocument();
    
    // 切り替えボタンが無効化されていることを確認
    const toggleButton = screen.getByText('詳細表示に切り替え');
    expect(toggleButton).toBeDisabled();
  });
});
