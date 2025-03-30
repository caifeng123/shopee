// 将csv -> json数组

import { readFileSync, writeFileSync } from "fs";

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 将 import.meta.url 转换为文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 转换 CSV的string数据为 JSON
function csvToJson(csv: string) {
  const lines = csv.trim().split("\n"); // 按行分割数据
  const headers = lines[0]
    .split(",")
    .map(header => header.trim())
    .filter(header => header !== ""); // 过滤掉空的表头字段

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(value => value.trim());
    const obj = {} as Record<string, string>;

    // 动态生成键值对，仅处理非空的表头字段
    headers.forEach((header, index) => {
      obj[header] = (values[index] || "").replace(/\"/g, ""); // 如果值为空，设置为 ""
    });

    result.push(obj);
  }

  return result;
}


function main(){
  const jsonData = csvToJson(readFileSync(resolve(__dirname,"test.csv"), "utf-8"));
  writeFileSync(resolve(__dirname,"test.json"), JSON.stringify(jsonData, null, 2));
}

main()
