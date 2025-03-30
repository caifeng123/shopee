// 下载数据到csv
export const downloadCSV = (csvContent: string, name: string) => {
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${name}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 将 JSON 转换为 CSV
export function jsonListToCsv(jsonData: Record<string, any>[]) {
  // 获取 CSV 的头部（字段名）
  const headers = Object.keys(jsonData[0]).join(",") + "\n";

  // 获取 CSV 的内容（每行数据）
  const rows = jsonData.map(obj => {
    return Object.values(obj).map(value => {
      // 如果值中包含逗号或换行符，使用双引号包裹
      if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
        return `"${value}"`;
      }
      return value;
    }).join(",");
  }).join("\n");

  // 合并头部和内容
  return headers + rows;
}