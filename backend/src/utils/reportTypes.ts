export type ExportFormat = "PDF" | "EXCEL" | "CSV" | "JSON";
export type ReportDataset = {
  title: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  summary?: Record<string, unknown>;
  chartPlaceholder?: string;
};
