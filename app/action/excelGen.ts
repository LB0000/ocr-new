"use server";

import ExcelJS from "exceljs";
import path from "path";
import { NextResponse } from "next/server";
import fs from "fs/promises";

// フィールドとセルのマッピング定義
interface CellMapping {
  cell: string;
  sheet?: string;
}

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

// フィールドとセルのマッピングテーブル
const fieldToCellMapping: Record<FieldKey, CellMapping> = {
  name: { cell: "B3" },
  furigana: { cell: "B2" },
  birthday: { cell: "B5" },
  address: { cell: "B7" },
  phone: { cell: "F6" },
  education: { cell: "C13" },
  workHistory: { cell: "C20" },
  licenses: { cell: "C26" },
  selfPR: { cell: "C30" },
  other: { cell: "C34" }
};

/**
 * マッピングされたフィールドデータをExcelテンプレートに書き込み、
 * ダウンロード可能なバイナリとして返す
 */
export async function POST(request: Request) {
  try {
    // リクエストからJSONデータを取得
    const data = await request.json();
    const fields = data.fields;

    if (!fields) {
      return new NextResponse("フィールドデータがありません", { status: 400 });
    }

    // テンプレートのパスを取得
    const templatePath = path.join(process.cwd(), "templates", "履歴書_template.xlsx");

    // テンプレートファイルの存在確認
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error("テンプレートファイルが見つかりません:", templatePath);
      return new NextResponse(`テンプレートファイルが見つかりません: ${templatePath}`, { status: 500 });
    }

    // Excelワークブックを読み込み
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // 最初のシートを取得（デフォルトでは「Sheet1」）
    const sheet = workbook.getWorksheet(1);

    if (!sheet) {
      return new NextResponse("Excelシートが見つかりません", { status: 500 });
    }

    // フィールドデータをセルに書き込み
    Object.entries(fields).forEach(([fieldKey, value]) => {
      // 型安全のためにキーをチェック
      if (isValidFieldKey(fieldKey)) {
        const mapping = fieldToCellMapping[fieldKey];
        
        if (mapping && value) {
          const cell = sheet.getCell(mapping.cell);
          
          // 文字列に変換して設定
          cell.value = String(value);
          
          // 複数行のテキストの場合、セル内で改行を有効にする
          if (String(value).includes("\n")) {
            cell.alignment = {
              vertical: 'top',
              wrapText: true
            };
          }
        }
      }
    });

    // Excelをバイナリに変換
    const buffer = await workbook.xlsx.writeBuffer();

    // バイナリをレスポンスとして返す
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="履歴書.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Excel生成エラー:", error);
    return new NextResponse(
      `Excel生成中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      { status: 500 }
    );
  }
}

/**
 * 文字列がFieldKey型として有効かチェックする
 */
function isValidFieldKey(key: string): key is FieldKey {
  return key in fieldToCellMapping;
}
