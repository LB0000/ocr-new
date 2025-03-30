"use client";

import { useState } from "react";
import { Preset, usePresets } from "../hooks/usePresets";
import { FieldKey } from "../components/OcrEditor";

interface PresetManagerProps {
  currentMappings: { [blockId: number]: FieldKey };
  onApplyPreset: (mappings: { [blockId: number]: FieldKey }) => void;
}

export default function PresetManager({ currentMappings, onApplyPreset }: PresetManagerProps) {
  const { 
    isLoading, 
    error, 
    addPreset, 
    updatePreset, 
    deletePreset, 
    getAllPresets 
  } = usePresets();
  
  const [presetName, setPresetName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // プリセット一覧を取得
  const presets = getAllPresets();

  // プリセットを保存
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert("プリセット名を入力してください");
      return;
    }

    // 現在のマッピングが空の場合は保存しない
    if (Object.keys(currentMappings).length === 0) {
      alert("マッピングが設定されていません");
      return;
    }

    const presetId = addPreset(presetName, currentMappings);
    if (presetId) {
      setPresetName("");
      setShowSaveDialog(false);
    }
  };

  // プリセットを適用
  const handleApplyPreset = (preset: Preset) => {
    onApplyPreset(preset.mappings);
  };

  // プリセットを削除
  const handleDeletePreset = (id: string) => {
    if (window.confirm(`プリセット「${presets.find(p => p.id === id)?.name}」を削除しますか？`)) {
      deletePreset(id);
    }
  };

  return (
    <div className="mb-4">
      {/* プリセット操作ボタン */}
      <div className="flex space-x-2 mb-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
          disabled={Object.keys(currentMappings).length === 0}
        >
          現在のマッピングを保存
        </button>
        <button
          onClick={() => setShowManageDialog(true)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          プリセット管理
        </button>
      </div>

      {/* プリセット選択ドロップダウン */}
      {presets.length > 0 && (
        <div className="flex items-center space-x-2">
          <select
            className="border rounded-md p-2 flex-grow"
            value={selectedPresetId || ""}
            onChange={(e) => setSelectedPresetId(e.target.value || null)}
          >
            <option value="">プリセットを選択...</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              const preset = presets.find(p => p.id === selectedPresetId);
              if (preset) handleApplyPreset(preset);
            }}
            disabled={!selectedPresetId}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            適用
          </button>
        </div>
      )}

      {/* プリセット保存ダイアログ */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">マッピングプリセットを保存</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プリセット名
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="例: 標準履歴書フォーマット"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={handleSavePreset}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プリセット管理ダイアログ */}
      {showManageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">プリセット管理</h3>
            {presets.length === 0 ? (
              <p className="text-gray-500">保存されたプリセットはありません</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">名前</th>
                      <th className="p-2 text-left">作成日時</th>
                      <th className="p-2 text-left">マッピング数</th>
                      <th className="p-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presets.map((preset) => (
                      <tr key={preset.id} className="border-t">
                        <td className="p-2">{preset.name}</td>
                        <td className="p-2">
                          {new Date(preset.createdAt).toLocaleString()}
                        </td>
                        <td className="p-2">{Object.keys(preset.mappings).length}</td>
                        <td className="p-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApplyPreset(preset)}
                              className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
                            >
                              適用
                            </button>
                            <button
                              onClick={() => handleDeletePreset(preset.id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowManageDialog(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
