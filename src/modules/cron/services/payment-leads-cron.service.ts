import { Injectable, Logger } from '@nestjs/common';
import { processAndRemoveEntries } from 'src/common/helpers/csv.helper';
import { PaymentLeadsDTO } from 'src/modules/payments/dto/upgrade-payment.dto';
import { PaymentRepository } from 'src/modules/payments/repositories/payment.repository';
import { PaymentsService } from 'src/modules/payments/services/payments.service';
import { ProductRepository } from 'src/modules/products/repositories/product.repository';

@Injectable()
export class PaymentLeadsCronService {
  private readonly logger = new Logger(PaymentLeadsCronService.name);

  constructor(
    private readonly paymentService: PaymentsService,
    private readonly paymentRepository: PaymentRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async checkPaymentLeads() {
    try {
      const rowsData = await processAndRemoveEntries('payment-leads.csv', 500);

      if (!Array.isArray(rowsData) || rowsData.length === 0) {
        this.logger.debug(`No data to process in CSV.`);
        return;
      }

      for (const rowData of rowsData) {
        const [studentName, studentEmail, productCode, referenceId, amountPaid] = rowData;

        // check reference id if already exists
        const existingPayment = await this.paymentRepository.findByReferenceId(referenceId);
        if (existingPayment) {
          this.logger.debug(`Reference Id already exists: ${studentEmail}`);
          continue;
        }

        // get product details
        const product = await this.productRepository.findByCode(productCode);
        if (!product) {
          this.logger.debug(`Invalid Product Code: ${studentEmail}`);
          continue;
        }

        const payment = await this.paymentService.createPayment({
          name: studentName,
          email: studentEmail,
          product_code: productCode,
          reference_id: referenceId,
          price: amountPaid,
        } as PaymentLeadsDTO);

        if (!payment) {
          this.logger.error(`Payment error occurred: ${studentEmail}`);
          continue;
        }

        this.logger.log(`Payment created: ${studentEmail}`);
      }
    } catch (error) {
      this.logger.error('An error occurred:', error.message);
    }
  }
}
