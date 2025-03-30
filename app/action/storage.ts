"use server";

/**
 * Vercel Blobへのファイルアップロード機能
 * 
 * このファイルはPDFやイメージファイルをVercel Blobストレージにアップロードする
 * サーバーアクションを提供します。
 */

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

/**
 * PDFファイルをVercel Blobにアップロードする
 * @param file アップロードするPDFファイル
 * @returns アップロード結果（URL、エラー情報など）
 */
export async function uploadPdfToVercelBlob(file: File) {
  try {
    // ファイルタイプの検証
    if (file.type !== 'application/pdf') {
      return { error: new Error('PDFファイルのみアップロード可能です') };
    }

    // ファイルサイズの検証（20MB以下）
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      return { error: new Error('ファイルサイズは20MB以下にしてください') };
    }

    // Vercel Blobにアップロード
    const blob = await put(`pdf-uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    // キャッシュを更新
    revalidatePath('/');

    return { url: blob.url };
  } catch (error) {
    console.error('PDFアップロードエラー:', error);
    return { error };
  }
}

/**
 * 画像ファイルをVercel Blobにアップロードする
 * @param file アップロードする画像ファイル
 * @returns アップロード結果（URL、エラー情報など）
 */
export async function uploadImageToVercelBlob(file: File) {
  try {
    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      return { error: new Error('画像ファイルのみアップロード可能です') };
    }

    // ファイルサイズの検証（10MB以下）
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return { error: new Error('ファイルサイズは10MB以下にしてください') };
    }

    // Vercel Blobにアップロード
    const blob = await put(`image-uploads/${Date.now()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    });

    // キャッシュを更新
    revalidatePath('/');

    return { url: blob.url };
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return { error };
  }
}
