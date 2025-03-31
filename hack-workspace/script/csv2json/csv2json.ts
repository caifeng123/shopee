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
    // 使用正则表达式匹配 CSV 行，支持引号包裹的字段或未包裹的字段
    const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(value => value.replace(/^"|"$/g, "").trim()) || [];
    const obj = {} as Record<string, string>;

    // 动态生成键值对，仅处理非空的表头字段
    headers.forEach((header, index) => {
      obj[header] = values[index] || ""; // 如果值为空，设置为 ""
    });

    result.push(obj);
  }

  return result;
}


function main(){
  const countries = [
    'tw',
    'th',
    'vn',
    'sg',
    'my',
    'ph',
  ]
  countries.forEach(country => {
    const jsonData = csvToJson(readFileSync(resolve(__dirname,'csv',`${country}.csv`), "utf-8"));
    writeFileSync(resolve(__dirname,'json',`${country}.json`), JSON.stringify(jsonData, null, 2));
  })
}

main()
