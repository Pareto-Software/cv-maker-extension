import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as pdfJs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api.js';
import * as mammoth from 'mammoth';

dotenv.config();
@Injectable()
export class DocumentParserService {
  /**
   * Extracts text from a PDF file buffer with pdfjs-dist.
   *
   * Using pdf.js produces font-related warnings which can be ignored because
   * this function is interested only in text content, not fonts.
   * Warning: TT: undefined function: 21
   * Warning: fetchStandardFontData: failed to fetch file "LiberationSans-Regular.ttf" with
   * "UnknownErrorException: Ensure that the `standardFontDataUrl` API parameter is provided.".
   *
   * @param pdfFile - The uploaded PDF file (from Multer) to extract text from.
   * @returns A promise resolving to a text string.
   * @throws Error if the PDF parsing fails.
   */
  async parsePdfFile(pdfFile: Express.Multer.File): Promise<string> {
    let fullText = '';

    try {
      const loadingTask = pdfJs.getDocument(new Uint8Array(pdfFile.buffer));
      const pdf: pdfJs.PDFDocumentProxy = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let previousY: number | null = null;
        let pageText = '';

        // Tracks the position of items to avoid extra spaces in parsed text
        for (const item of textContent.items) {
          if ('str' in item) {
            const textItem = item as TextItem;
            const currentY = textItem.transform[5];

            if (previousY !== null && Math.abs(currentY - previousY) > 5) {
              pageText += '\n';
            }

            pageText += textItem.str;
            previousY = currentY;
          }
        }

        fullText += pageText.trim() + '\n';
      }

      return fullText;
    } catch (e: any) {
      console.error('Error while parsing pdf from buffer:', e);
      return fullText;
    }
  }

  /**
   * Extracts text from a DOCX file.
   * @param file - The uploaded DOCX file (from Multer) to extract text from.
   * @returns The extracted text as a string.
   */
  async parseDocxFile(file: Express.Multer.File): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });

      if (result.value) {
        return result.value;
      }

      return '';
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw error;
    }
  }
}
