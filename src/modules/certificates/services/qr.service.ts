import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async generateQrCode(text: string, backgroundColor: string = '#ffffff'): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        rendererOpts: {
          quality: 1,
        },
        color: {
          dark: '#515151', // QR code color
          light: backgroundColor, // Background color
        },
      });
    } catch (err) {
      throw new Error('Failed to generate QR code');
    }
  }
}
