// Build a CSV in the browser and hand it to the user as a download.
// Excel-friendly: UTF-8 BOM so accented names survive, CRLF line ends,
// and anything with a comma, quote or newline is quoted.
export function downloadCsv(filename, headers, rows) {
  const escape = (value) => {
    const s = value == null ? "" : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers, ...rows].map((row) => row.map(escape).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// "Winter Classic" + "tee sheet" -> "winter-classic-tee-sheet.csv"
export function csvFilename(...parts) {
  const slug = parts
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "export"}.csv`;
}
