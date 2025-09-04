import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function addWatermark(pdfBytes: Uint8Array, text: string) {
  const pdf = await PDFDocument.load(pdfBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  pages.forEach(p => {
    const { width, height } = p.getSize();
    p.drawText(text, {
      x: 40, y: 24,
      size: 9, font,
      color: rgb(0.6,0.6,0.6), opacity: 0.5
    });
  });
  return await pdf.save();
}