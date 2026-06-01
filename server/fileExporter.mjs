const LABELS = {
  defaultTitle: "办公处理结果",
  fallbackFilename: "OfficeFlow-AI-办公结果",
  companyTitle: "OfficeFlow AI 办公自动化产物",
  taskType: "场景类型",
  audience: "面向对象",
  department: "所属部门",
  generatedAt: "生成时间",
  empty: "未填写",
  summary: "摘要",
  keyPoints: "关键要点",
  todos: "待办事项",
  polished: "润色稿",
  formattedDraft: "修正后正文",
  companyFormatRules: "公司固定格式",
  formatIssues: "格式不符项",
  typoIssues: "错别字/表达风险",
  risks: "风险提示",
  sourceSummary: "联网检索搜索",
  reviewChecklist: "复核清单",
  recommendation: "建议",
  index: "序号",
  title: "标题",
  source: "来源",
  content: "内容",
  owner: "负责人",
  item: "事项",
  due: "截止时间",
  risk: "风险",
};

const MIME_TYPES = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function clean(value) {
  return String(value || "").trim();
}

function escapeXml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function listText(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (item && typeof item === "object") {
        return [item.owner, item.item, item.due].map(clean).filter(Boolean).join(" / ");
      }
      return clean(item);
    })
    .filter(Boolean);
}

function todoRows(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (item && typeof item === "object") {
        return [clean(item.owner), clean(item.item), clean(item.due)];
      }
      return ["", clean(item), ""];
    })
    .filter((row) => row.some(Boolean));
}

function filenameBase(output) {
  const title = clean(output.title) || LABELS.fallbackFilename;
  return title.replace(/[\\/:*?"<>|\r\n]+/g, "_").slice(0, 48).replace(/[ ._]+$/g, "") || LABELS.fallbackFilename;
}

function dosDateTime(date = new Date()) {
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const crc = crc32(content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(day, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(day, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function paragraph(text, style = "") {
  const pStyle = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  return `<w:p>${pStyle}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function bullet(text) {
  return paragraph(`• ${text}`);
}

function table(rows) {
  if (!rows.length) return "";
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/></w:tblPr>${rows
    .map(
      (row) =>
        `<w:tr>${row
          .map((cell) => `<w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr>${paragraph(cell)}</w:tc>`)
          .join("")}</w:tr>`,
    )
    .join("")}</w:tbl>`;
}

function addOptionalDocxSections(parts, output) {
  const sections = [
    [LABELS.formattedDraft, output.formattedDraft],
    [LABELS.companyFormatRules, output.companyFormatRules],
    [LABELS.formatIssues, output.formatIssues],
    [LABELS.typoIssues, output.typoIssues],
    [LABELS.polished, output.polishedDraft],
    [LABELS.risks, output.riskItems],
  ];
  for (const [title, value] of sections) {
    if (Array.isArray(value) && value.length) parts.push(paragraph(title, "Heading1"), ...listText(value).map(bullet));
    if (!Array.isArray(value) && value) parts.push(paragraph(title, "Heading1"), paragraph(value));
  }
}

function buildDocx(output) {
  const keyPoints = listText(output.keyPoints);
  const todos = todoRows(output.todos);
  const reviewChecklist = listText(output.reviewChecklist);
  const parts = [
    paragraph(LABELS.companyTitle, "Heading1"),
    paragraph(clean(output.title) || LABELS.defaultTitle, "Title"),
    table([
      [LABELS.taskType, clean(output.taskType) || "office"],
      [LABELS.audience, clean(output.audience) || LABELS.empty],
      [LABELS.department, clean(output.department) || LABELS.empty],
      [LABELS.generatedAt, new Date().toLocaleString("zh-CN", { hour12: false })],
    ]),
    paragraph(LABELS.summary, "Heading1"),
    paragraph(clean(output.summary) || "暂无摘要。"),
  ];

  if (keyPoints.length) parts.push(paragraph(LABELS.keyPoints, "Heading1"), ...keyPoints.map(bullet));
  if (todos.length) parts.push(paragraph(LABELS.todos, "Heading1"), table([[LABELS.owner, LABELS.item, LABELS.due], ...todos]));
  addOptionalDocxSections(parts, output);
  if (Array.isArray(output.sourceLinks) && output.sourceLinks.length) {
    parts.push(
      paragraph(LABELS.sourceSummary, "Heading1"),
      table([
        [LABELS.title, LABELS.summary, LABELS.source],
        ...output.sourceLinks.map((link) => [clean(link.title), clean(link.summary), clean(link.source)]),
      ]),
    );
  }
  if (reviewChecklist.length) parts.push(paragraph(LABELS.reviewChecklist, "Heading1"), ...reviewChecklist.map(bullet));
  parts.push(paragraph(LABELS.recommendation, "Heading1"), paragraph(clean(output.recommendation) || "建议人工复核后再发送或归档。"));

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: "word/_rels/document.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      name: "word/document.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${parts.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>
</w:document>`,
    },
    {
      name: "word/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="36"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr></w:style>
</w:styles>`,
    },
  ]);
}

function optionalSheets(output) {
  const sheets = [];
  const pushList = (title, items) => {
    const values = listText(items);
    if (values.length) sheets.push([title, [[LABELS.index, LABELS.content], ...values.map((item, index) => [index + 1, item])]]);
  };
  if (output.polishedDraft) sheets.push([LABELS.polished, [[LABELS.content], [output.polishedDraft]]]);
  if (output.formattedDraft) sheets.push([LABELS.formattedDraft, [[LABELS.content], [output.formattedDraft]]]);
  pushList(LABELS.companyFormatRules, output.companyFormatRules);
  pushList(LABELS.formatIssues, output.formatIssues);
  pushList(LABELS.typoIssues, output.typoIssues);
  pushList(LABELS.risks, output.riskItems);
  pushList(LABELS.reviewChecklist, output.reviewChecklist);
  return sheets;
}

function buildXlsx(output) {
  const sheets = [
    [LABELS.summary, [
      [LABELS.companyTitle, ""],
      [LABELS.title, clean(output.title)],
      [LABELS.taskType, clean(output.taskType)],
      [LABELS.audience, clean(output.audience)],
      [LABELS.department, clean(output.department)],
      [LABELS.generatedAt, new Date().toLocaleString("zh-CN", { hour12: false })],
      [LABELS.summary, clean(output.summary)],
      [LABELS.recommendation, clean(output.recommendation)],
    ]],
    [LABELS.keyPoints, [[LABELS.index, LABELS.content], ...listText(output.keyPoints).map((item, index) => [index + 1, item])]],
    [LABELS.todos, [[LABELS.owner, LABELS.item, LABELS.due], ...todoRows(output.todos)]],
    ...optionalSheets(output),
  ];
  if (Array.isArray(output.sourceLinks) && output.sourceLinks.length) {
    sheets.push([
      LABELS.sourceSummary,
      [
        [LABELS.title, LABELS.summary, LABELS.source],
        ...output.sourceLinks.map((link) => [clean(link.title), clean(link.summary), clean(link.source)]),
      ],
    ]);
  }

  const cellRef = (rowIndex, colIndex) => {
    let name = "";
    let col = colIndex;
    while (col) {
      const remainder = (col - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      col = Math.floor((col - 1) / 26);
    }
    return `${name}${rowIndex}`;
  };
  const sheetXml = (rows) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="8" width="24" customWidth="1"/></cols><sheetData>${rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map((value, colIndex) => `<c r="${cellRef(rowIndex + 1, colIndex + 1)}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`)
          .join("")}</row>`,
    )
    .join("")}</sheetData></worksheet>`;

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
        .map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
        .join("")}</Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
        .map(([name], index) => `<sheet name="${escapeXml(name).slice(0, 31)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
        .join("")}</sheets></workbook>`,
    },
    ...sheets.map(([, rows], index) => ({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      content: sheetXml(rows),
    })),
  ]);
}

export async function exportOfficeFile(payload) {
  const output = payload.output || {};
  const format = clean(payload.format).toLowerCase();
  const builders = { docx: buildDocx, xlsx: buildXlsx };
  const builder = builders[format];
  if (!builder) throw new Error("暂不支持该导出格式。");
  const content = builder(output);
  return {
    ok: true,
    filename: `${filenameBase(output)}.${format}`,
    mime: MIME_TYPES[format],
    dataBase64: content.toString("base64"),
  };
}
