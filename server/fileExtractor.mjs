import { inflateRawSync, inflateSync } from "node:zlib";

const MAX_EXCEL_ROWS_PER_SHEET = 80;
const MAX_EXCEL_SHEETS = 3;
const MAX_WORD_PARAGRAPHS = 220;
const MAX_EXTRACTED_TEXT_CHARS = 80_000;
const MAX_PDF_TEXT_CHUNKS = 500;
const MAX_INLINE_PDF_BYTES = 5_000_000;
const MAX_OFFICE_BYTES = 120_000_000;

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function decodeText(buffer) {
  const utf8 = buffer.toString("utf8");
  if (!utf8.includes("\uFFFD")) return utf8.replace(/^\uFEFF/, "");
  return buffer.toString("latin1");
}

function limitExtractedText(text, note = "") {
  const value = String(text || "");
  if (value.length <= MAX_EXTRACTED_TEXT_CHARS) {
    return { text: value, note };
  }
  return {
    text: `${value.slice(0, MAX_EXTRACTED_TEXT_CHARS)}\n\n（内容较长，已截取前 ${MAX_EXTRACTED_TEXT_CHARS} 字用于 AI 分析。）`,
    note: note || `内容较长，已截取前 ${MAX_EXTRACTED_TEXT_CHARS} 字用于 AI 分析。`,
  };
}

function shouldTakeZipEntry(name, wanted) {
  if (!wanted) return true;
  if (wanted instanceof Set) return wanted.has(name);
  return wanted(name);
}

function readZipEntries(buffer, wanted) {
  const entries = new Map();
  let offset = 0;

  while (offset + 30 <= buffer.length) {
    if (buffer.readUInt32LE(offset) !== 0x04034b50) break;
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const fileNameStart = offset + 30;
    const fileNameEnd = fileNameStart + fileNameLength;
    const dataStart = fileNameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = buffer.subarray(fileNameStart, fileNameEnd).toString("utf8");
    const compressed = buffer.subarray(dataStart, dataEnd);

    if (shouldTakeZipEntry(name, wanted)) {
      if (method === 0) {
        entries.set(name, compressed);
      } else if (method === 8) {
        entries.set(name, inflateRawSync(compressed));
      }
    }

    offset = dataEnd;
  }

  return entries;
}

function extractTagBlocks(xml, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[\\s\\S]*?</${tagName}>`, "g");
  return xml.match(pattern) || [];
}

function extractTextNodes(xml) {
  const values = [];
  const pattern = /<[^:>]*:?t\b[^>]*>([\s\S]*?)<\/[^:>]*:?t>/g;
  let match;
  while ((match = pattern.exec(xml))) {
    values.push(decodeXml(match[1]));
  }
  return values;
}

function extractDocx(buffer) {
  const entries = readZipEntries(buffer, new Set(["word/document.xml"]));
  const documentXml = entries.get("word/document.xml");
  if (!documentXml) {
    throw new Error("没有找到 Word 正文内容，请确认上传的是 .docx 文件。");
  }

  const xml = documentXml.toString("utf8");
  const paragraphs = [];
  const paragraphPattern = /<w:p\b[\s\S]*?<\/w:p>/g;
  let paragraphMatch;
  while ((paragraphMatch = paragraphPattern.exec(xml)) && paragraphs.length < MAX_WORD_PARAGRAPHS) {
    const text = clean(extractTextNodes(paragraphMatch[0]).join(""));
    if (text) paragraphs.push(text);
  }

  if (!paragraphs.length) {
    throw new Error("没有从 Word 文件中读取到可用文本。");
  }

  return paragraphs.join("\n");
}

function columnNameToIndex(name) {
  return name.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function extractSharedStrings(entries) {
  const sharedXml = entries.get("xl/sharedStrings.xml");
  if (!sharedXml) return [];
  return extractTagBlocks(sharedXml.toString("utf8"), "si").map((block) =>
    clean(extractTextNodes(block).join("")),
  );
}

function extractSheetNames(entries) {
  const workbookXml = entries.get("xl/workbook.xml");
  if (!workbookXml) return [];
  const names = [];
  const pattern = /<sheet\b[^>]*name="([^"]+)"[^>]*>/g;
  let match;
  while ((match = pattern.exec(workbookXml.toString("utf8")))) {
    names.push(decodeXml(match[1]));
  }
  return names;
}

function extractCellValue(cellXml, sharedStrings) {
  const type = /<c\b[^>]*\bt="([^"]+)"/.exec(cellXml)?.[1] || "";
  const inline = /<is\b[\s\S]*?<\/is>/.exec(cellXml)?.[0];
  if (inline) return clean(extractTextNodes(inline).join(""));

  const value = /<v>([\s\S]*?)<\/v>/.exec(cellXml)?.[1] || "";
  if (type === "s") return clean(sharedStrings[Number(value)] || "");
  if (type === "str") return clean(decodeXml(value));
  return clean(value);
}

function extractXlsx(buffer) {
  const entries = readZipEntries(buffer, (name) =>
    name === "xl/sharedStrings.xml" ||
    name === "xl/workbook.xml" ||
    /^xl\/worksheets\/sheet\d+\.xml$/.test(name),
  );
  const sheetEntries = [...entries.keys()]
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0));
  if (!sheetEntries.length) {
    throw new Error("没有找到 Excel 工作表内容，请确认上传的是 .xlsx/.xlsm 文件。");
  }

  const sharedStrings = extractSharedStrings(entries);
  const sheetNames = extractSheetNames(entries);
  const parts = [];

  sheetEntries.slice(0, MAX_EXCEL_SHEETS).forEach((entryName, sheetIndex) => {
    const sheetName = sheetNames[sheetIndex] || `Sheet${sheetIndex + 1}`;
    const xml = entries.get(entryName).toString("utf8");
    const rowPattern = /<row\b[\s\S]*?<\/row>/g;
    let rowCount = 0;
    parts.push(`工作表：${sheetName}`);

    let rowMatch;
    while ((rowMatch = rowPattern.exec(xml)) && rowCount < MAX_EXCEL_ROWS_PER_SHEET) {
      const rowXml = rowMatch[0];
      const cells = [];
      const cellPattern = /<c\b[^>]*\br="([A-Z]+)\d+"[^>]*>[\s\S]*?<\/c>/g;
      let match;
      while ((match = cellPattern.exec(rowXml))) {
        cells[columnNameToIndex(match[1])] = extractCellValue(match[0], sharedStrings);
      }
      const values = cells.map((value) => value || "");
      if (values.some(Boolean)) {
        parts.push(values.join("\t").replace(/\s+$/g, ""));
        rowCount += 1;
      }
    }
    if (rowMatch) {
      parts.push(`（已截取前 ${MAX_EXCEL_ROWS_PER_SHEET} 行）`);
    }
  });

  const text = parts.join("\n").trim();
  if (!text) throw new Error("没有从 Excel 文件中读取到可用文本。");
  return text;
}

function decodePdfTextToken(token) {
  if (token.startsWith("(")) {
    return token
      .slice(1, -1)
      .replace(/\\([\\()])/g, "$1")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t");
  }

  const hex = token.slice(1, -1).replace(/\s+/g, "");
  if (!hex) return "";
  const bytes = Buffer.from(hex, "hex");
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString("utf16le");
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString("utf16le");
  return bytes.toString("utf8");
}

function pdfTextSources(buffer) {
  const sources = [buffer.toString("latin1")];
  const raw = sources[0];
  const streamPattern = /(<<[\s\S]*?>>)\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;

  while ((match = streamPattern.exec(raw))) {
    if (!/\/FlateDecode/.test(match[1])) continue;
    try {
      const data = Buffer.from(match[2], "latin1");
      sources.push(inflateSync(data).toString("latin1"));
    } catch {
      try {
        sources.push(inflateRawSync(Buffer.from(match[2], "latin1")).toString("latin1"));
      } catch {
        // Ignore unreadable PDF streams and keep looking for plain text.
      }
    }
  }

  return sources;
}

function extractPdf(buffer) {
  const chunks = [];
  const tokenPattern = /(\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]{4,}>)(?=\s*Tj|\s*')/g;

  for (const source of pdfTextSources(buffer)) {
    let match;
    while ((match = tokenPattern.exec(source)) && chunks.length < MAX_PDF_TEXT_CHUNKS) {
      const text = clean(decodePdfTextToken(match[1]));
      if (text && /[\p{L}\p{N}\u4e00-\u9fff]/u.test(text)) chunks.push(text);
    }

    const arrayPattern = /\[((?:\s*(?:\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]{4,}>|-?\d+(?:\.\d+)?))*\s*)\]\s*TJ/g;
    while ((match = arrayPattern.exec(source)) && chunks.length < MAX_PDF_TEXT_CHUNKS) {
      const text = [...match[1].matchAll(/\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]{4,}>/g)]
        .map((item) => decodePdfTextToken(item[0]))
        .join("");
      const cleaned = clean(text);
      if (cleaned && /[\p{L}\p{N}\u4e00-\u9fff]/u.test(cleaned)) chunks.push(cleaned);
    }
  }

  const text = chunks.join("\n").trim();
  if (!text) {
    throw new Error("该 PDF 可能是扫描件或加密/复杂编码文件，请粘贴文本或上传 Word/Excel。");
  }
  return text;
}

export async function extractUploadedFile(payload) {
  const name = payload.name || "uploaded-file";
  const raw = Buffer.isBuffer(payload.dataBuffer)
    ? payload.dataBuffer
    : Buffer.from(payload.dataBase64 || "", "base64");
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  if (raw.length > MAX_OFFICE_BYTES) {
    throw new Error("文件较大，已停止完整解析以保证页面流畅。请粘贴关键正文，或拆分后上传。");
  }

  let text;
  if (["txt", "md", "csv", "json", "log"].includes(extension)) {
    text = decodeText(raw);
  } else if (extension === "docx") {
    text = extractDocx(raw);
  } else if (["xlsx", "xlsm", "xltx"].includes(extension)) {
    text = extractXlsx(raw);
  } else if (extension === "pdf") {
    if (raw.length > MAX_INLINE_PDF_BYTES) {
      throw new Error("PDF 文件较大，为保证上传速度，请粘贴关键正文，或上传 Word/Excel 版本。");
    }
    text = extractPdf(raw);
  } else {
    throw new Error(`暂不支持 .${extension || "unknown"} 文件，请上传 txt、docx、pdf、xlsx 或 xlsm。`);
  }

  const limited = ["docx", "xlsx", "xlsm", "xltx"].includes(extension);
  const limitedResult = limitExtractedText(
    text,
    limited ? "已快速提取文件中的关键文本，未完整还原全部格式。" : "",
  );
  return {
    ok: true,
    fileName: name,
    text: limitedResult.text,
    partial: limited || limitedResult.text !== text,
    note: limitedResult.note,
  };
}
