"use client";

import { useState } from "react";
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

// フィールドラベル定義
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

interface ExcelPreviewProps {
  mappedFields: MappedFields;
}

export default function ExcelPreview({ mappedFields }: ExcelPreviewProps) {
  const [showFullPreview, setShowFullPreview] = useState(false);

  // プレビューを切り替える
  const toggleFullPreview = () => {
    setShowFullPreview(!showFullPreview);
  };

  // マッピングされたフィールドが空かどうかをチェック
  const isEmpty = Object.keys(mappedFields).length === 0;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Excel出力プレビュー</h3>
        <button
          onClick={toggleFullPreview}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isEmpty}
        >
          {showFullPreview ? "簡易表示に切り替え" : "詳細表示に切り替え"}
        </button>
      </div>

      {isEmpty ? (
        <div className="p-4 bg-gray-50 text-gray-500 rounded-md border text-center">
          マッピングされたフィールドがありません
        </div>
      ) : showFullPreview ? (
        // 詳細なExcelプレビュー
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 p-2 text-center text-sm font-medium border-b">
            履歴書_template.xlsx
          </div>
          <div className="p-4 bg-white overflow-auto" style={{ maxHeight: "500px" }}>
            <table className="excel-preview-table">
              <tbody>
                {/* ヘッダー行（A, B, C, ...） */}
                <tr>
                  <th></th>
                  <th>A</th>
                  <th>B</th>
                  <th>C</th>
                  <th>D</th>
                  <th>E</th>
                  <th>F</th>
                  <th>G</th>
                </tr>
                
                {/* 行1 */}
                <tr>
                  <th>1</th>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行2: ふりがな */}
                <tr>
                  <th>2</th>
                  <td></td>
                  <td className={mappedFields.furigana ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.furigana || ""}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行3: 氏名 */}
                <tr>
                  <th>3</th>
                  <td></td>
                  <td className={mappedFields.name ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.name || ""}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行4 */}
                <tr>
                  <th>4</th>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行5: 生年月日 */}
                <tr>
                  <th>5</th>
                  <td></td>
                  <td className={mappedFields.birthday ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.birthday || ""}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行6: 電話番号 */}
                <tr>
                  <th>6</th>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.phone ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.phone || ""}
                  </td>
                  <td></td>
                </tr>
                
                {/* 行7: 住所 */}
                <tr>
                  <th>7</th>
                  <td></td>
                  <td className={mappedFields.address ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.address || ""}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行8-12: 空白行 */}
                {[8, 9, 10, 11, 12].map(row => (
                  <tr key={row}>
                    <th>{row}</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
                
                {/* 行13: 学歴 */}
                <tr>
                  <th>13</th>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.education ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.education ? (
                      <div className="whitespace-pre-line">{mappedFields.education}</div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行14-19: 空白行 */}
                {[14, 15, 16, 17, 18, 19].map(row => (
                  <tr key={row}>
                    <th>{row}</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
                
                {/* 行20: 職歴 */}
                <tr>
                  <th>20</th>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.workHistory ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.workHistory ? (
                      <div className="whitespace-pre-line">{mappedFields.workHistory}</div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行21-25: 空白行 */}
                {[21, 22, 23, 24, 25].map(row => (
                  <tr key={row}>
                    <th>{row}</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
                
                {/* 行26: 免許・資格 */}
                <tr>
                  <th>26</th>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.licenses ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.licenses ? (
                      <div className="whitespace-pre-line">{mappedFields.licenses}</div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行27-29: 空白行 */}
                {[27, 28, 29].map(row => (
                  <tr key={row}>
                    <th>{row}</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
                
                {/* 行30: 自己PR */}
                <tr>
                  <th>30</th>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.selfPR ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.selfPR ? (
                      <div className="whitespace-pre-line">{mappedFields.selfPR}</div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                
                {/* 行31-33: 空白行 */}
                {[31, 32, 33].map(row => (
                  <tr key={row}>
                    <th>{row}</th>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
                
                {/* 行34: その他 */}
                <tr>
                  <th>34</th>
                  <td></td>
                  <td></td>
                  <td className={mappedFields.other ? "bg-yellow-100 font-medium" : ""}>
                    {mappedFields.other ? (
                      <div className="whitespace-pre-line">{mappedFields.other}</div>
                    ) : (
                      ""
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // 簡易プレビュー
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 p-2 text-center text-sm font-medium border-b">
            マッピング概要
          </div>
          <div className="p-4 bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left border">フィールド</th>
                  <th className="p-2 text-left border">セル</th>
                  <th className="p-2 text-left border">内容</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(mappedFields).map(([key, value]) => (
                  <tr key={key} className="border-t">
                    <td className="p-2 border font-medium">
                      {fieldLabels[key as FieldKey] || key}
                    </td>
                    <td className="p-2 border">{cellMappings[key as FieldKey] || "-"}</td>
                    <td className="p-2 border">
                      <div className="max-h-20 overflow-auto whitespace-pre-line">
                        {value}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
