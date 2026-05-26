export type ParsedCsv = {
  headers: string[];
  rows: string[][];
};

function normalizeLineEndings(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * Minimal CSV parser (comma-delimited) that supports:
 * - quoted fields with commas
 * - escaped quotes ("")
 *
 * It is intentionally small to avoid adding CSV dependencies.
 */
export function parseCsv(text: string, delimiter = ","): ParsedCsv {
  const input = normalizeLineEndings(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    // Ignore fully empty trailing rows.
    if (row.length === 1 && row[0].trim() === "") {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (ch === '"') {
      const next = input[i + 1];
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      pushCell();
      continue;
    }

    if (!inQuotes && ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }

    cell += ch;
  }

  // Flush final cell/row.
  if (cell.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }

  const headers = (rows[0] ?? []).map((h) => h.trim());
  const dataRows = rows.slice(1);

  return { headers, rows: dataRows };
}

