"use client";

import { useState } from "react";
import { FieldKey } from "../components/OcrEditor";
import { predictFieldMappings, getSortedPredictions } from "../utils/fieldPrediction";

interface AutoMappingControlProps {
  blocks: { id: number; text: string }[];
  onApplyMappings: (mappings: { [blockId: number]: FieldKey }) => void;
}

export default function AutoMappingControl({ blocks, onApplyMappings }: AutoMappingControlProps) {
  const [showPredictions, setShowPredictions] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  // 自動マッピングを実行
  const handleAutoMapping = () => {
    const mappings = predictFieldMappings(blocks);
    onApplyMappings(mappings);
  };

  // 予測結果を表示
  const togglePredictions = () => {
    setShowPredictions(!showPredictions);
  };

  // 信頼度閾値を変更
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfidenceThreshold(parseFloat(e.target.value));
  };

  // 信頼度に基づいてソートされた予測結果を取得
  const sortedPredictions = getSortedPredictions(blocks);

  // フィールドタイプの日本語名を取得
  const getFieldLabel = (fieldKey: FieldKey): string => {
    const fieldLabels: { [key in FieldKey]: string } = {
      name: "氏名",
      furigana: "ふりがな",
      birthday: "生年月日",
      address: "住所",
      phone: "電話番号",
      education: "学歴",
      workHistory: "職歴",
      licenses: "免許・資格",
      selfPR: "自己PR",
      other: "その他"
    };
    return fieldLabels[fieldKey] || fieldKey;
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-2 mb-2">
        <button
          onClick={handleAutoMapping}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
        >
          AIによる自動マッピング
        </button>
        <button
          onClick={togglePredictions}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          {showPredictions ? "予測結果を隠す" : "予測結果を表示"}
        </button>
      </div>

      {showPredictions && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              信頼度閾値: {confidenceThreshold.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={confidenceThreshold}
              onChange={handleThresholdChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              閾値以上の信頼度を持つ予測のみが自動マッピングに使用されます
            </p>
          </div>

          <h4 className="font-medium mb-2">フィールド予測結果</h4>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">テキスト</th>
                  <th className="p-2 text-left">予測フィールド</th>
                  <th className="p-2 text-left">信頼度</th>
                </tr>
              </thead>
              <tbody>
                {sortedPredictions.map((prediction) => (
                  <tr
                    key={prediction.blockId}
                    className={`border-t ${
                      prediction.confidence >= confidenceThreshold
                        ? "bg-green-50"
                        : ""
                    }`}
                  >
                    <td className="p-2 truncate max-w-xs" title={prediction.text}>
                      {prediction.text}
                    </td>
                    <td className="p-2">{getFieldLabel(prediction.fieldKey)}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="w-16">
                          {(prediction.confidence * 100).toFixed(0)}%
                        </div>
                        <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              prediction.confidence >= confidenceThreshold
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                            style={{ width: `${prediction.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                // 閾値以上の信頼度を持つ予測のみを適用
                const filteredMappings: { [blockId: number]: FieldKey } = {};
                sortedPredictions.forEach((prediction) => {
                  if (prediction.confidence >= confidenceThreshold) {
                    filteredMappings[prediction.blockId] = prediction.fieldKey;
                  }
                });
                onApplyMappings(filteredMappings);
              }}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
            >
              この閾値で適用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
