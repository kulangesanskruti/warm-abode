import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { ReportDataset } from "../utils/reportTypes";

const scalar = (value: unknown) =>
  value instanceof Date ? value.toISOString() : value == null ? "" : String(value);
const csvEscape = (value: unknown) => {
  const text = scalar(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const fileExportService = {
  async csv(dataset: ReportDataset) {
    return Buffer.from(
      [
        dataset.columns.map(csvEscape).join(","),
        ...dataset.rows.map((row) =>
          dataset.columns.map((column) => csvEscape(row[column])).join(","),
        ),
      ].join("\n"),
      "utf8",
    );
  },
  async json(dataset: ReportDataset) {
    return Buffer.from(JSON.stringify(dataset, null, 2), "utf8");
  },
  async excel(dataset: ReportDataset) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");
    sheet.addRow(dataset.columns);
    dataset.rows.forEach((row) => sheet.addRow(dataset.columns.map((column) => row[column])));
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 22;
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
  },
  async pdf(
    dataset: ReportDataset,
    options: { watermark?: string; signature?: string; businessName?: string } = {},
  ) {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.fontSize(20).text(options.businessName || "StayHub", { align: "center" });
      doc.moveDown(0.4).fontSize(15).text(dataset.title, { align: "center" });
      doc
        .fontSize(9)
        .fillColor("#666")
        .text(`Generated ${new Date().toISOString()}`, { align: "center" });
      doc.fillColor("#111").moveDown();
      if (dataset.summary) {
        doc.fontSize(11).text("Summary", { underline: true });
        Object.entries(dataset.summary).forEach(([key, value]) =>
          doc.fontSize(9).text(`${key}: ${scalar(value)}`),
        );
        doc.moveDown();
      }
      doc
        .fontSize(10)
        .fillColor("#555")
        .text(dataset.chartPlaceholder || "Charts placeholder", { align: "center" });
      doc.moveDown();
      doc.fillColor("#111").fontSize(9);
      dataset.columns.forEach((column) =>
        doc.text(column, 48, doc.y, { continued: true, width: 100 }),
      );
      doc.text("");
      dataset.rows.forEach((row) => {
        if (doc.y > 720) doc.addPage();
        doc.text(dataset.columns.map((column) => scalar(row[column])).join(" | "));
      });
      if (options.signature) doc.moveDown().text(`Owner signature: ${options.signature}`);
      if (options.watermark)
        doc.fontSize(8).fillColor("#999").text(options.watermark, 48, 740, { align: "center" });
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i += 1) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor("#777")
          .text(`StayHub • Page ${i + 1} of ${pages.count}`, 48, 760, { align: "center" });
      }
      doc.end();
    });
  },
  /** Rent receipt PDF — mirrors the on-screen receipt layout. */
  async rentReceipt(receipt: any) {
    const inr = (value: number) => `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
    const day = (iso: string | null) =>
      iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
    const monthName = new Date(receipt.year, receipt.month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: "A4" });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header band
      doc.rect(48, 48, 499, 64).fill("#111827");
      doc.fillColor("#ffffff").fontSize(18).text("StayHub", 66, 64);
      doc.fontSize(9).fillColor("#d1d5db").text("Rent Payment Receipt", 66, 88);
      doc
        .fontSize(9)
        .fillColor("#d1d5db")
        .text("Receipt No.", 380, 64, { width: 150, align: "right" });
      doc
        .fontSize(11)
        .fillColor("#ffffff")
        .text(String(receipt.receiptNumber), 380, 78, { width: 150, align: "right" });
      doc
        .fontSize(9)
        .fillColor("#86efac")
        .text(`Status: ${receipt.status}`, 380, 94, { width: 150, align: "right" });

      doc.fillColor("#111827").fontSize(10);
      let y = 136;
      const rows: [string, string][] = [
        ["Tenant Name", receipt.tenant.fullName],
        ["Tenant Phone", receipt.tenant.phone || "-"],
        ["Property", receipt.property.propertyName],
        ["Property Address", [receipt.property.address, receipt.property.city].filter(Boolean).join(", ") || "-"],
        ["Room Number", receipt.room.number],
        ["Bed Number", receipt.bed.number],
        ["Rent Month", monthName],
        ["Payment Date", day(receipt.paymentDate)],
        ["Payment Method", String(receipt.paymentMethod || "-").replace(/_/g, " ")],
        ["Reference ID", receipt.referenceNumber || "-"],
        ["Monthly Rent", inr(receipt.rentAmount)],
        ["Late Fee", inr(receipt.lateFee)],
        ["Discount", inr(receipt.discount)],
        ["Outstanding", inr(receipt.outstandingAmount)],
      ];
      rows.forEach(([label, value]) => {
        doc.fillColor("#6b7280").fontSize(9).text(label, 66, y, { width: 160 });
        doc.fillColor("#111827").fontSize(10).text(String(value ?? "-"), 236, y - 1, { width: 300 });
        y += 22;
      });

      // Amount paid highlight
      y += 6;
      doc.roundedRect(66, y, 463, 40, 8).fill("#ecfdf5");
      doc.fillColor("#047857").fontSize(11).text("Amount Paid", 82, y + 14);
      doc
        .fontSize(16)
        .fillColor("#047857")
        .text(inr(receipt.amountPaid), 300, y + 10, { width: 213, align: "right" });
      y += 66;

      doc.fillColor("#6b7280").fontSize(9).text("Received By", 66, y);
      doc.fillColor("#111827").fontSize(10).text(receipt.owner.fullName, 66, y + 14);
      if (receipt.owner.phone) doc.fillColor("#6b7280").fontSize(9).text(receipt.owner.phone, 66, y + 30);
      doc
        .fillColor("#6b7280")
        .fontSize(9)
        .text(`Generated on ${day(receipt.generatedAt)}`, 300, y, { width: 229, align: "right" });
      doc
        .fillColor("#9ca3af")
        .fontSize(8)
        .text("This is a computer generated receipt from StayHub.", 66, y + 70, {
          width: 463,
          align: "center",
        });

      doc.end();
    });
  },
};
