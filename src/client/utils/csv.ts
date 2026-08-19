// Minimal, dependency-free RFC4180-ish CSV read/write — good enough for
// this app's simple tabular exports. No support for embedded newlines
// inside a cell (none of this app's export fields ever need that).

export const toCsvCell = (cell: string | number): string => {
  const str = String(cell ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const toCsv = (rows: (string | number)[][]): string =>
  rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');

// Parses CSV text into rows of raw string cells — handles quoted cells
// (embedded commas and escaped "" quotes).
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  const lines = text.split(/\r\n|\n|\r/).filter((line) => line.length > 0);
  for (const line of lines) {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        cells.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current);
    rows.push(cells);
  }
  return rows;
};

// Triggers a browser download of the given text as a file — no server
// round-trip needed, the CSV is already fully built client-side.
export const downloadTextFile = (
  content: string,
  filename: string,
  mimeType = 'text/csv;charset=utf-8;',
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
