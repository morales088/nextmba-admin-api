import { Body, Controller, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PdfService } from 'src/common/utils/pdf.service';
import { Response } from 'express';

@Controller('payments')
// @UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly pdfService: PdfService
  ) {}

  @Get('/generate/:paymentId')
  async generatePdf(@Res() res: Response, @Param('paymentId') paymentId: number): Promise<void> {
    const studentInfo = await this.paymentsService.studentPaymentInfo(paymentId);

    const htmlFilePath = 'src/common/templates/invoice.template.html';

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit',
      // second: '2-digit',
      // timeZoneName: 'short',
    };
    const formattedDate = studentInfo.createdAt.toLocaleDateString('en-US', options);

    const data = {
      invoiceNumber: studentInfo.reference_id,
      dateIssue: formattedDate,
      dateDue: formattedDate,
      studentName: studentInfo.student.name,
      studentEmail: studentInfo.student.email,
      studentCountry: studentInfo.student.country ?? '',
      studentNumber: studentInfo.student.phone ?? '',
      productInfo: `$${Number(studentInfo.price).toFixed(2)} USD due ${formattedDate}`,
      description: studentInfo.product.name,
      qty: 1,
      price: Number(studentInfo.price).toFixed(2),
      amount: Number(studentInfo.price).toFixed(2),
      subtotal: Number(studentInfo.price).toFixed(2),
      total: Number(studentInfo.price).toFixed(2),
      amountDue: Number(studentInfo.price).toFixed(2),
    };

    const pdfBuffer = await this.pdfService.generatePdfFromHtmlFileWithVariables(htmlFilePath, data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');

    res.send(pdfBuffer);
  }

  @Get('/:paymentId')
  @UseGuards(AuthGuard('jwt'))
  async getPayment(@Param('paymentId') paymentId: number) {
    return await this.paymentsService.getPayment(paymentId);
  }

  @Get('/')
  @UseGuards(AuthGuard('jwt'))
  async getPayments(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page_number') page_number?: number,
    @Query('per_page') per_page?: number
  ) {
    const user = req.user;
    const pageNumber = page_number ? page_number : 1;
    const perPage = per_page ? per_page : 10;
    return await this.paymentsService.getPayments(user, search, pageNumber, perPage);
  }

  @Post('/manual')
  @UseGuards(AuthGuard('jwt'))
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const paymentData = {
      ...createPaymentDto,
      payment_method: 2,
    };
    return await this.paymentsService.createPayment(paymentData);
  }

  @Put('/manual/:paymentId')
  @UseGuards(AuthGuard('jwt'))
  async updatePayment(@Param('paymentId') paymentId: number, @Body() updatePaymentDto: UpdatePaymentDto) {
    const paymentData = {
      ...updatePaymentDto,
    };
    return await this.paymentsService.updatePayment(paymentId, paymentData);
  }
}
