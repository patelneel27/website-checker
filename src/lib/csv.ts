// CSV with a UTF-8 BOM so Excel shows £, é etc. correctly. Cells that a spreadsheet would treat
// as formulas are prefixed with an apostrophe (CSV injection protection).

function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "﻿No leads yet\r\n";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(cell).join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}
