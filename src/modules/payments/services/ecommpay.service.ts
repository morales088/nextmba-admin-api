import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateEcommpayPaymentDto } from '../dto/ecommpay-payment.dto';
const { Payment } = require('ecommpay');
import * as crypto from 'crypto';

@Injectable()
export class EcommpayService {
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly callbackUrl: string;

  constructor() {
    this.apiKey = process.env.ECOMMPAY_SECRET_KEY;
    this.projectId = process.env.ECOMMPAY_PROJECT_ID;
    this.callbackUrl = process.env.ECOMMPAY_CALLBACK_URL;
  }

  async createEcommpayPayment(paymentData: CreateEcommpayPaymentDto) {
    const {
      product_code,
      email,
      customer_first_name,
      customer_last_name,
      payment_currency,
      payment_amount,
      force_payment_method,
      target_element,
      success_url,
    } = paymentData;

    const ecommPayment = new Payment(this.projectId, this.apiKey);
    const generatedPaymentId = `ecom${crypto.randomBytes(8).toString('hex')}`;
    // const generatedPaymentId = crypto.randomInt(8);

    // Populate the ecommPayment object
    ecommPayment.paymentId = generatedPaymentId;
    ecommPayment.paymentCurrency = payment_currency;
    ecommPayment.paymentAmount = payment_amount;
    ecommPayment.paymentCustomerEmail = email;
    ecommPayment.paymentCustomerFirstName = customer_first_name;
    ecommPayment.paymentCustomerLastName = customer_last_name;
    ecommPayment.forcePaymentMethod = force_payment_method;
    ecommPayment.targetElement = target_element;

    // Collect data to sign and pass to params
    const dataToSign = {
      project_id: this.projectId,
      payment_id: generatedPaymentId.toString(),
      payment_amount: payment_amount.toString(),
      payment_currency,
      customer_first_name,
      customer_last_name,
      email,
      product_code,
      force_payment_method,
      target_element,
      success_url,
    };
    console.log(`💡 ~ dataToSign:`, dataToSign);

    const stringToSign = this.convertDataStringToSign(dataToSign);

    // Calculate HMAC SHA-512 and encode in Base64
    const signature = crypto.createHmac('sha512', this.apiKey).update(stringToSign).digest('base64');
    console.log(`💡 ~ signature:`, signature);

    const queryParams = new URLSearchParams({
      signature: signature,
      ...dataToSign,
    }).toString();
    console.log(`💡 ~ queryParams:`, queryParams);

    const redirectUrl = `${this.callbackUrl}?${queryParams}`;
    ecommPayment.redirectSuccessUrl = redirectUrl;
    console.log(`💡 ~ ecommPayment:`, ecommPayment);

    return ecommPayment.getUrl();
  }

  // Helper function to convert data to the required string format
  private convertDataStringToSign(data: Record<string, any>): string {
    return Object.keys(data)
      .map((key) => {
        let value = data[key];
        if (typeof value === 'boolean') {
          value = value ? '1' : '0'; // Convert Boolean to 1/0
        }
        return `${key}:${value}`;
      })
      .sort()
      .join(';');
  }

  async checkPayment(payload: Record<string, any>) {
    const { signature, ...withoutSignature } = payload;
    console.log(`💡 ~ withoutSignature:`, withoutSignature)

    // recreate the string that was signed
    const stringToSign = this.convertDataStringToSign(withoutSignature);
    // calculate HMAC SHA-512 using your secret key and compare
    const expectedSignature = crypto.createHmac('sha512', this.apiKey).update(stringToSign).digest('base64');
    console.log(`💡 ~ signature:`, signature);
    console.log(`💡 ~ expectedSignature:`, expectedSignature);

    // compare the expected signature with the received signature
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new UnprocessableEntityException('Invalid signature: Data integrity check failed');
    }

    return true;
  }
}
