"use client";

import { useState, useEffect, useCallback } from "react";
import { MappedFields, FieldKey } from "../components/OcrEditor";

// プリセットの型定義
export interface Preset {
  id: string;
  name: string;
  mappings: { [blockId: number]: FieldKey };
  createdAt: number;
}

// プリセット一覧の型定義
export interface PresetList {
  [id: string]: Preset;
}

// ローカルストレージのキー
const PRESETS_STORAGE_KEY = "pdf2md_mapping_presets";

/**
 * マッピングプリセットを管理するカスタムフック
 */
export function usePresets() {
  const [presets, setPresets] = useState<PresetList>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // プリセットをローカルストレージから読み込む
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      }
      setError(null);
    } catch (err) {
      console.error("プリセットの読み込みエラー:", err);
      setError("プリセットの読み込み中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // プリセットをローカルストレージに保存する
  const savePresetsToStorage = useCallback((updatedPresets: PresetList) => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    } catch (err) {
      console.error("プリセットの保存エラー:", err);
      setError("プリセットの保存中にエラーが発生しました");
    }
  }, []);

  // 新しいプリセットを追加する
  const addPreset = useCallback((name: string, mappings: { [blockId: number]: FieldKey }) => {
    try {
      const id = `preset_${Date.now()}`;
      const newPreset: Preset = {
        id,
        name,
        mappings,
        createdAt: Date.now(),
      };

      const updatedPresets = {
        ...presets,
        [id]: newPreset,
      };

      setPresets(updatedPresets);
      savePresetsToStorage(updatedPresets);
      return id;
    } catch (err) {
      console.error("プリセットの追加エラー:", err);
      setError("プリセットの追加中にエラーが発生しました");
      return null;
    }
  }, [presets, savePresetsToStorage]);

  // プリセットを更新する
  const updatePreset = useCallback((id: string, updates: Partial<Omit<Preset, "id" | "createdAt">>) => {
    try {
      if (!presets[id]) {
        throw new Error(`プリセット ID ${id} が見つかりません`);
      }

      const updatedPreset = {
        ...presets[id],
        ...updates,
      };

      const updatedPresets = {
        ...presets,
        [id]: updatedPreset,
      };

      setPresets(updatedPresets);
      savePresetsToStorage(updatedPresets);
      return true;
    } catch (err) {
      console.error("プリセットの更新エラー:", err);
      setError("プリセットの更新中にエラーが発生しました");
      return false;
    }
  }, [presets, savePresetsToStorage]);

  // プリセットを削除する
  const deletePreset = useCallback((id: string) => {
    try {
      if (!presets[id]) {
        throw new Error(`プリセット ID ${id} が見つかりません`);
      }

      const { [id]: _, ...remainingPresets } = presets;
      setPresets(remainingPresets);
      savePresetsToStorage(remainingPresets);
      return true;
    } catch (err) {
      console.error("プリセットの削除エラー:", err);
      setError("プリセットの削除中にエラーが発生しました");
      return false;
    }
  }, [presets, savePresetsToStorage]);

  // すべてのプリセットを取得する
  const getAllPresets = useCallback(() => {
    return Object.values(presets).sort((a, b) => b.createdAt - a.createdAt);
  }, [presets]);

  // プリセットを取得する
  const getPreset = useCallback((id: string) => {
    return presets[id] || null;
  }, [presets]);

  return {
    presets,
    isLoading,
    error,
    addPreset,
    updatePreset,
    deletePreset,
    getAllPresets,
    getPreset,
  };
}
