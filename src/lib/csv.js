// Build a CSV in the browser and hand it to the user as a download.
// Excel-friendly: UTF-8 BOM so accented names survive, CRLF line ends,
// and anything with a comma, quote or newline is quoted.
export function downloadCsv(filename, headers, rows) {
  const escape = (value) => {
    let s = value == null ? "" : String(value);
    // Public form input lands in these sheets: stop Excel treating a cell
    // like "=HYPERLINK(...)" as a formula (CSV injection). A leading +/- is
    // left alone when the whole cell is a phone number like "+61 412 345 678".
    if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^\+[\d\s()-]+$/.test(s))) {
      s = `'${s}`;
    }
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
  // Revoking straight after click() can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
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
