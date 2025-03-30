"use client";

import { useState, useEffect, useCallback } from "react";
import { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";
import PresetManager from "./PresetManager";
import AutoMappingControl from "./AutoMappingControl";
import ExcelPreview from "./ExcelPreview";
import "../styles/excelPreview.css";

// フィールドキーの型定義
export type FieldKey =
  | "name"
  | "furigana"
  | "birthday"
  | "address"
  | "phone"
  | "education"
  | "workHistory"
  | "licenses"
  | "selfPR"
  | "other";

// OCRブロックの型定義
export interface OCRBlock {
  id: number;
  text: string;
}

// マッピングされたフィールドの型定義
export type MappedFields = {
  [key in FieldKey]?: string;
};

// フィールド定義
const fieldDefinitions: { key: FieldKey; label: string; description: string }[] = [
  { key: "name", label: "氏名", description: "例: 山田 太郎" },
  { key: "furigana", label: "ふりがな", description: "例: やまだ たろう" },
  { key: "birthday", label: "生年月日", description: "例: 1990年1月1日生 (満33歳)" },
  { key: "address", label: "住所", description: "例: 東京都新宿区西新宿2-8-1" },
  { key: "phone", label: "電話番号", description: "例: 090-1234-5678" },
  { key: "education", label: "学歴", description: "例: 2009.4 ○○大学入学..." },
  { key: "workHistory", label: "職歴", description: "例: 2013.4 ○○株式会社入社..." },
  { key: "licenses", label: "免許・資格", description: "例: 普通自動車第一種運転免許..." },
  { key: "selfPR", label: "自己PR", description: "例: 私は..." },
  { key: "other", label: "その他", description: "その他の情報" },
];

interface OcrEditorProps {
  ocrResult: OCRResponse | null;
  onSave: (mappedFields: MappedFields) => void;
  isLoading?: boolean;
}

export default function OcrEditor({ ocrResult, onSave, isLoading = false }: OcrEditorProps) {
  // OCRブロックの状態
  const [blocks, setBlocks] = useState<OCRBlock[]>([]);
  // 選択されたフィールドの状態
  const [selectedFields, setSelectedFields] = useState<{ [blockId: number]: FieldKey }>({});
  // 編集されたテキストの状態
  const [editedTexts, setEditedTexts] = useState<{ [blockId: number]: string }>({});
  // 選択中のブロックIDs（複数選択用）
  const [selectedBlockIds, setSelectedBlockIds] = useState<number[]>([]);
  // マッピング結果のプレビュー
  const [mappedFieldsPreview, setMappedFieldsPreview] = useState<MappedFields>({});
  // Excelプレビューの表示状態
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  // OCR結果からブロックを抽出
  useEffect(() => {
    if (ocrResult && ocrResult.pages) {
      const extractedBlocks: OCRBlock[] = [];
      
      // 各ページのマークダウンを行に分割
      ocrResult.pages.forEach((page, pageIndex) => {
        if (page.markdown) {
          const lines = page.markdown.split("\n");
          lines.forEach((line, lineIndex) => {
            // 空行をスキップ
            if (line.trim()) {
              extractedBlocks.push({
                id: pageIndex * 1000 + lineIndex, // ユニークIDを生成
                text: line.trim()
              });
            }
          });
        }
      });
      
      setBlocks(extractedBlocks);
      
      // 初期状態のeditedTextsを設定
      const initialEditedTexts: { [blockId: number]: string } = {};
      extractedBlocks.forEach(block => {
        initialEditedTexts[block.id] = block.text;
      });
      setEditedTexts(initialEditedTexts);
    }
  }, [ocrResult]);

  // マッピング結果のプレビューを更新するメモ化関数
  const updateMappedFieldsPreview = useCallback(() => {
    const mappedFields: MappedFields = {};
    
    // 各フィールドタイプごとにテキストを集約
    Object.entries(selectedFields).forEach(([blockIdStr, fieldKey]) => {
      const blockId = parseInt(blockIdStr);
      const text = editedTexts[blockId] || "";
      
      if (mappedFields[fieldKey]) {
        // 既に同じフィールドタイプのテキストがある場合は改行で追加
        mappedFields[fieldKey] = `${mappedFields[fieldKey]}\n${text}`;
      } else {
        // 初めてのフィールドタイプの場合は新規設定
        mappedFields[fieldKey] = text;
      }
    });
    
    setMappedFieldsPreview(mappedFields);
  }, [selectedFields, editedTexts]);

  // 選択されたフィールドまたは編集されたテキストが変更されたときにプレビューを更新
  useEffect(() => {
    updateMappedFieldsPreview();
  }, [selectedFields, editedTexts, updateMappedFieldsPreview]);

  // フィールド選択の変更ハンドラ
  const handleFieldChange = (blockId: number, fieldKey: FieldKey) => {
    setSelectedFields(prev => ({
      ...prev,
      [blockId]: fieldKey
    }));
  };

  // テキスト編集の変更ハンドラ
  const handleTextChange = (blockId: number, text: string) => {
    setEditedTexts(prev => ({
      ...prev,
      [blockId]: text
    }));
  };

  // ブロック選択の切り替えハンドラ
  const toggleBlockSelection = (blockId: number) => {
    setSelectedBlockIds(prev => {
      if (prev.includes(blockId)) {
        return prev.filter(id => id !== blockId);
      } else {
        return [...prev, blockId];
      }
    });
  };

  // 選択したブロックを結合するハンドラ
  const handleCombineBlocks = (fieldKey: FieldKey) => {
    if (selectedBlockIds.length < 2) return;
    
    // 選択されたブロックのテキストを結合
    const combinedText = selectedBlockIds
      .sort((a, b) => a - b) // IDでソートして順序を保証
      .map(id => editedTexts[id] || "")
      .join("\n");
    
    // 最初のブロックに結合テキストを設定
    const firstBlockId = Math.min(...selectedBlockIds);
    
    // 状態を更新
    setEditedTexts(prev => ({
      ...prev,
      [firstBlockId]: combinedText
    }));
    
    setSelectedFields(prev => {
      const newSelectedFields = { ...prev };
      newSelectedFields[firstBlockId] = fieldKey;
      
      // 他のブロックの選択を解除
      selectedBlockIds.forEach(id => {
        if (id !== firstBlockId) {
          delete newSelectedFields[id];
        }
      });
      
      return newSelectedFields;
    });
    
    // 選択をクリア
    setSelectedBlockIds([]);
  };

  // プリセットを適用するハンドラ
  const handleApplyPreset = (mappings: { [blockId: number]: FieldKey }) => {
    // 現在のブロックIDに合わせてマッピングを調整
    const currentBlockIds = blocks.map(block => block.id);
    const adjustedMappings: { [blockId: number]: FieldKey } = {};
    
    // プリセットのマッピングを現在のブロックに適用
    // 注: ブロックIDが一致しない場合は、順番に割り当てる簡易的な方法
    const presetBlockIds = Object.keys(mappings).map(id => parseInt(id));
    
    if (currentBlockIds.length > 0 && presetBlockIds.length > 0) {
      // 現在のブロック数とプリセットのマッピング数の小さい方まで適用
      const minLength = Math.min(currentBlockIds.length, presetBlockIds.length);
      
      for (let i = 0; i < minLength; i++) {
        const presetBlockId = presetBlockIds[i];
        const currentBlockId = currentBlockIds[i];
        adjustedMappings[currentBlockId] = mappings[presetBlockId];
      }
      
      setSelectedFields(adjustedMappings);
    }
  };

  // 自動マッピングを適用するハンドラ
  const handleApplyAutoMapping = (mappings: { [blockId: number]: FieldKey }) => {
    setSelectedFields(prev => ({
      ...prev,
      ...mappings
    }));
  };

  // Excelプレビューの表示/非表示を切り替え
  const toggleExcelPreview = () => {
    setShowExcelPreview(!showExcelPreview);
  };

  // マッピング結果を保存するハンドラ
  const handleSave = () => {
    onSave(mappedFieldsPreview);
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-orange-500 mx-auto mb-2"
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
          <p className="font-medium">OCR結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  // OCR結果がない場合
  if (!ocrResult || !blocks.length) {
    return (
      <div className="p-5 bg-yellow-50 text-yellow-800 rounded-md">
        <h3 className="font-bold text-lg mb-2">OCR結果がありません</h3>
        <p>PDFをアップロードして、OCR処理を実行してください。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 border-b">
        <h2 className="text-xl font-semibold mb-2">OCR結果のマッピング</h2>
        <p className="text-gray-600 mb-4">
          各テキスト行を適切なフィールドに割り当ててください。複数行を選択して結合することもできます。
        </p>
        
        {/* 自動マッピングコントロール */}
        <AutoMappingControl 
          blocks={blocks} 
          onApplyMappings={handleApplyAutoMapping} 
        />
        
        {/* プリセットマネージャー */}
        <PresetManager 
          currentMappings={selectedFields} 
          onApplyPreset={handleApplyPreset} 
        />
        
        {/* 複数選択時の結合ツール */}
        {selectedBlockIds.length >= 2 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center">
            <span className="mr-2">{selectedBlockIds.length}行選択中:</span>
            <select
              className="border rounded px-2 py-1 mr-2"
              onChange={(e) => handleCombineBlocks(e.target.value as FieldKey)}
              defaultValue=""
            >
              <option value="" disabled>フィールドを選択して結合</option>
              {fieldDefinitions.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}に結合
                </option>
              ))}
            </select>
            <button
              className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
              onClick={() => setSelectedBlockIds([])}
            >
              選択解除
            </button>
          </div>
        )}
      </div>

      {/* OCRブロック一覧 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`flex flex-col md:flex-row gap-2 p-3 rounded-md ${
                selectedBlockIds.includes(block.id)
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center md:w-8">
                <input
                  type="checkbox"
                  checked={selectedBlockIds.includes(block.id)}
                  onChange={() => toggleBlockSelection(block.id)}
                  className="w-4 h-4"
                />
              </div>
              
              <div className="flex-1">
                <textarea
                  value={editedTexts[block.id] || ""}
                  onChange={(e) => handleTextChange(block.id, e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={2}
                />
              </div>
              
              <div className="md:w-48">
                <select
                  value={selectedFields[block.id] || ""}
                  onChange={(e) => handleFieldChange(block.id, e.target.value as FieldKey)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">フィールドを選択</option>
                  {fieldDefinitions.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* マッピング結果プレビュー */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">マッピング結果プレビュー</h3>
          <button
            onClick={toggleExcelPreview}
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={Object.keys(mappedFieldsPreview).length === 0}
          >
            {showExcelPreview ? "Excelプレビューを隠す" : "Excelプレビューを表示"}
          </button>
        </div>

        {/* 通常のマッピング結果プレビュー */}
        {!showExcelPreview && (
          <div className="bg-white p-3 rounded-md border max-h-48 overflow-auto">
            {Object.keys(mappedFieldsPreview).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(mappedFieldsPreview).map(([fieldKey, text]) => {
                  const fieldDef = fieldDefinitions.find(f => f.key === fieldKey as FieldKey);
                  return (
                    <div key={fieldKey} className="flex flex-col">
                      <span className="font-medium">{fieldDef?.label || fieldKey}:</span>
                      <span className="text-gray-700 whitespace-pre-line">{text}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">フィールドが選択されていません</p>
            )}
          </div>
        )}

        {/* Excelプレビュー */}
        {showExcelPreview && Object.keys(mappedFieldsPreview).length > 0 && (
          <ExcelPreview mappedFields={mappedFieldsPreview} />
        )}
      </div>

      {/* アクションボタン */}
      <div className="bg-white p-4 border-t flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md shadow-sm transition-colors"
          disabled={Object.keys(mappedFieldsPreview).length === 0}
        >
          Excelに出力
        </button>
      </div>
    </div>
  );
}
