import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly client: Razorpay;

  constructor(private readonly config: ConfigService) {
    this.keyId = this.config.get<string>('razorpay.keyId') ?? '';
    this.keySecret = this.config.get<string>('razorpay.keySecret') ?? '';
    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  getKeyId(): string {
    this.assertConfigured();
    return this.keyId;
  }

  async createOrder(params: {
    amountPaise: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    this.assertConfigured();
    const order = await this.client.orders.create({
      amount: params.amountPaise,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });
    this.logger.log(`Razorpay order created: ${order.id}`);
    return {
      id: String(order.id),
      amount: Number(order.amount),
      currency: String(order.currency),
    };
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    this.assertConfigured();
    const expected = createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    try {
      return timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signature, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  private assertConfigured() {
    if (!this.keyId || !this.keySecret) {
      throw new InternalServerErrorException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }
  }
}
