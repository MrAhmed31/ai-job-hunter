export async function extractTextFromFile(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<string> {
  switch (fileType) {
    case "pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "txt":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export function detectFileType(filename: string): "pdf" | "docx" | "txt" | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "docx" || ext === "txt") return ext;
  return null;
}

export function validateResumeText(text: string): boolean {
  return text.trim().length >= 100;
}
