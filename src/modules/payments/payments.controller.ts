import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Redirect,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './services/payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PdfService } from 'src/common/utils/pdf.service';
import { Response } from 'express';
import { BillingRepository } from '../billings/repositories/billing.repository';
import { UpgradePaymentDTO } from './dto/upgrade-payment.dto';
import { ExportPaymentFilterDTO, SearchPaymentFilterDTO } from './dto/filter-payment.dto';
import * as excel from 'exceljs';
import { Payments } from '@prisma/client';

@Controller('payments')
// @UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly pdfService: PdfService,
    private readonly billingRepository: BillingRepository
  ) {}

  @Get('/upgrade')
  // @Redirect(`${process.env.STUDENT_ROUTE}/home?upgrade=success`)
  async upgradePayment(@Res() res: Response, @Query() upgradePaymentDto: UpgradePaymentDTO) {
    try {
      await this.paymentsService.createPayment({ ...upgradePaymentDto });
      return res.redirect(
        `${process.env.STUDENT_ROUTE}/home?upgrade=success&payment_id=${upgradePaymentDto.reference_id}&product_code=${upgradePaymentDto.product_code}&name=${upgradePaymentDto.name}`
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/generate/:paymentId')
  async generatePdf(@Res() res: Response, @Param('paymentId') paymentId: number): Promise<void> {
    const studentInfo = await this.paymentsService.studentPaymentInfo(paymentId);

    const htmlFilePath = 'src/common/templates/invoice.template.html';

    const studentBillingInfo = await this.billingRepository.findByStudId(studentInfo.student_id);
    const billingName =
      studentBillingInfo && studentBillingInfo.name ? studentBillingInfo.name : studentInfo.student.name;
    const billingEmail =
      studentBillingInfo && studentBillingInfo.email ? studentBillingInfo.email : studentInfo.student.email;
    const billingAddress =
      studentBillingInfo && studentBillingInfo.address ? studentBillingInfo.address : studentInfo.student.country ?? '';

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

      studentName: billingName,
      studentEmail: billingEmail,
      studentCountry: billingAddress,
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
  async getPayments(@Request() req: any, @Query() searchPaymentFilterDto: SearchPaymentFilterDTO) {
    const user = req.user;
    const { per_page: perPage, page_number: pageNumber, ...searchFilter } = searchPaymentFilterDto;
    return this.paymentsService.getPayments(user, searchFilter, pageNumber, perPage);
  }

  @Post('/manual')
  @UseGuards(AuthGuard('jwt'))
  async createPayment(@Request() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    const user = req.user;
    const paymentData = {
      ...createPaymentDto,
      created_by: user.userId,
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

  @Get('/download/csv')
  @UseGuards(AuthGuard('jwt'))
  async downloadPayments(@Res() res: Response, @Request() req: any, @Query() filterQueryDto: ExportPaymentFilterDTO) {
    const admin = req.user;
    const { search, product_code, start_date, end_date } = filterQueryDto;
    const searchFilters = { search, product_code, start_date, end_date };

    let allPayments = [];
    let page = 1;
    let perPage = 1000;

    while (true) {
      const payments = await this.paymentsService.getPayments(admin, searchFilters, page, perPage);

      if (payments.length === 0) break;

      allPayments = allPayments.concat(payments);
      page++;
    }

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 10 },
      { header: 'Email', key: 'email', width: 15 },
      { header: 'Reference ID', key: 'reference_id', width: 10 },
      { header: 'Product Name', key: 'product_name', width: 10 },
      { header: 'Payment Amount', key: 'payment_amount', width: 10 },
      { header: 'Product Code', key: 'product_code', width: 10 },
      { header: 'Date Created', key: 'date_created', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    const results = allPayments as [any];

    results.forEach((payment) => {
      const status = payment.status == 1 ? 'active' : 'deleted';
      const paymentAmount = typeof payment.price === 'string' ? parseInt(payment.price) : payment.price;

      worksheet.addRow({
        id: payment.id,
        name: payment.name,
        email: payment.email,
        reference_id: payment.reference_id,
        product_name: payment.product.name,
        payment_amount: paymentAmount,
        product_code: payment.product_code,
        date_created: payment.createdAt.toLocaleString(),
        status: status,
      });
    });

    // Set up the response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');

    // Stream the workbook to the response
    await workbook.csv.write(res);

    // End the response
    res.end();
  }
}
