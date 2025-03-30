import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePresets } from '../app/hooks/usePresets';

// モックのローカルストレージ
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// グローバルのlocalStorageをモックに置き換え
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('usePresets', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty presets', () => {
    const { result } = renderHook(() => usePresets());
    
    expect(result.current.presets).toEqual([]);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('resume-mapping-presets');
  });

  it('should save a new preset', () => {
    const { result } = renderHook(() => usePresets());
    
    const mockMappings = {
      1: 'name',
      2: 'furigana',
      3: 'birthday',
    };
    
    act(() => {
      result.current.savePreset('テスト用プリセット', mockMappings);
    });
    
    expect(result.current.presets.length).toBe(1);
    expect(result.current.presets[0].name).toBe('テスト用プリセット');
    expect(result.current.presets[0].mappings).toEqual(mockMappings);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('should not save a preset with an empty name', () => {
    const { result } = renderHook(() => usePresets());
    
    const mockMappings = {
      1: 'name',
      2: 'furigana',
    };
    
    act(() => {
      result.current.savePreset('', mockMappings);
    });
    
    expect(result.current.presets.length).toBe(0);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should not save a preset with empty mappings', () => {
    const { result } = renderHook(() => usePresets());
    
    act(() => {
      result.current.savePreset('テスト用プリセット', {});
    });
    
    expect(result.current.presets.length).toBe(0);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it('should delete a preset', () => {
    const { result } = renderHook(() => usePresets());
    
    // プリセットを2つ保存
    act(() => {
      result.current.savePreset('プリセット1', { 1: 'name' });
      result.current.savePreset('プリセット2', { 2: 'furigana' });
    });
    
    expect(result.current.presets.length).toBe(2);
    
    // 最初のプリセットを削除
    act(() => {
      result.current.deletePreset(0);
    });
    
    expect(result.current.presets.length).toBe(1);
    expect(result.current.presets[0].name).toBe('プリセット2');
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('should load presets from localStorage on initialization', () => {
    // ローカルストレージにプリセットを設定
    const mockPresets = [
      { name: '保存済みプリセット1', mappings: { 1: 'name' } },
      { name: '保存済みプリセット2', mappings: { 2: 'furigana' } },
    ];
    
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockPresets));
    
    const { result } = renderHook(() => usePresets());
    
    expect(result.current.presets.length).toBe(2);
    expect(result.current.presets[0].name).toBe('保存済みプリセット1');
    expect(result.current.presets[1].name).toBe('保存済みプリセット2');
  });

  it('should handle invalid JSON in localStorage', () => {
    // 不正なJSONをローカルストレージに設定
    mockLocalStorage.getItem.mockReturnValueOnce('invalid json');
    
    const { result } = renderHook(() => usePresets());
    
    // エラーが発生せず、空の配列で初期化されることを確認
    expect(result.current.presets).toEqual([]);
  });
});
