import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { MappedFields, FieldKey } from "../components/OcrEditor";

// セルマッピング定義
const cellMappings: { [key in FieldKey]: string } = {
  name: "B3",
  furigana: "B2",
  birthday: "B5",
  address: "B7",
  phone: "F6",
  education: "C13",
  workHistory: "C20",
  licenses: "C26",
  selfPR: "C30",
  other: "C34"
};

/**
 * マッピングされたフィールドをExcelテンプレートに書き込み、ダウンロード可能なバイナリを生成する
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストからデータを取得
    const data = await request.json();
    const fields: MappedFields = data.fields || {};

    // テンプレートファイルのパスを取得
    const templatePath = path.join(process.cwd(), "templates", "履歴書_template.xlsx");

    // テンプレートファイルの存在確認
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "テンプレートファイルが見つかりません" },
        { status: 404 }
      );
    }

    // Excelワークブックを作成
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // 最初のワークシートを取得
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: "ワークシートが見つかりません" },
        { status: 500 }
      );
    }

    // フィールドをセルに書き込み
    Object.entries(fields).forEach(([fieldKey, value]) => {
      if (isValidFieldKey(fieldKey as FieldKey) && value) {
        const cellAddress = cellMappings[fieldKey as FieldKey];
        if (cellAddress) {
          const cell = worksheet.getCell(cellAddress);
          cell.value = value;
        }
      }
    });

    // Excelファイルをバッファに書き込み
    const buffer = await workbook.xlsx.writeBuffer();

    // レスポンスを返す
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="履歴書_${new Date().toISOString().split("T")[0]}.xlsx"`
      }
    });
  } catch (error) {
    console.error("Excel生成エラー:", error);
    return NextResponse.json(
      { error: "Excelファイルの生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

/**
 * 有効なフィールドキーかどうかを判定する
 */
function isValidFieldKey(key: string): key is FieldKey {
  return [
    "name",
    "furigana",
    "birthday",
    "address",
    "phone",
    "education",
    "workHistory",
    "licenses",
    "selfPR",
    "other"
  ].includes(key);
}
