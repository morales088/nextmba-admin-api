// pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  async generatePdfFromHtmlFileWithVariables(
    htmlFilePath: string,
    data: Record<string, any>,
  ): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlContent = this.renderHtmlWithVariables(htmlFilePath, data);

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    return pdfBuffer;
  }

  private renderHtmlWithVariables(htmlFilePath: string, data: Record<string, any>): string {
    let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, data[key]);
      }
    }

    return htmlContent;
  }
}
