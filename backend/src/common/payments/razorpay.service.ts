import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';

export type RazorpaySubscriptionInfo = {
  id: string;
  plan_id: string;
  status: string;
  paid_count: number;
  total_count: number;
  /** Unix seconds; end of the current billing cycle, i.e. the next charge. */
  current_end?: number | null;
  charge_at?: number | null;
  ended_at?: number | null;
};

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;
  private readonly client: Razorpay;

  constructor(private readonly config: ConfigService) {
    this.keyId = this.config.get<string>('razorpay.keyId') ?? '';
    this.keySecret = this.config.get<string>('razorpay.keySecret') ?? '';
    this.webhookSecret =
      this.config.get<string>('razorpay.webhookSecret') ?? '';
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
      payment_capture: 1,
      payment: {
        capture: 'automatic',
        capture_options: {
          automatic_expiry_period: 12,
          manual_expiry_period: 7200,
          refund_speed: 'optimum',
        },
      },
    } as any);
    this.logger.log(`Razorpay order created: ${order.id} (auto-capture enabled)`);
    return {
      id: String(order.id),
      amount: Number(order.amount),
      currency: String(order.currency),
    };
  }

  async capturePayment(
    paymentId: string,
    amountPaise: number,
    currency: string = 'INR',
  ): Promise<any> {
    this.assertConfigured();
    try {
      const captured = await this.client.payments.capture(
        paymentId,
        amountPaise,
        currency,
      );
      this.logger.log(`Razorpay payment captured successfully: ${paymentId}`);
      return captured;
    } catch (err: any) {
      const desc = err?.error?.description || err?.message || '';
      if (/already\s+been\s+captured/i.test(desc)) {
        this.logger.log(`Razorpay payment ${paymentId} was already captured.`);
        return null;
      }
      throw err;
    }
  }

  async fetchOrder(orderId: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    notes: Record<string, string>;
  }> {
    this.assertConfigured();
    const order = await this.client.orders.fetch(orderId);
    const notes = (order.notes ?? {}) as Record<string, string>;
    return {
      id: String(order.id),
      amount: Number(order.amount),
      currency: String(order.currency),
      notes,
    };
  }

  async fetchPayment(paymentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    amount_refunded: number;
    refund_status?: string | null;
    order_id?: string | null;
    notes?: Record<string, string>;
  }> {
    this.assertConfigured();
    const payment = await this.client.payments.fetch(paymentId);
    return payment as any;
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

  async createPlan(params: {
    period: 'monthly' | 'yearly';
    interval: number;
    amountPaise: number;
    currency: string;
    name: string;
  }): Promise<string> {
    this.assertConfigured();
    const plan = await this.client.plans.create({
      period: params.period,
      interval: params.interval,
      item: {
        name: params.name,
        amount: params.amountPaise,
        currency: params.currency,
      },
    });
    this.logger.log(`Razorpay plan created: ${plan.id}`);
    return String(plan.id);
  }

  async createSubscription(params: {
    planId: string;
    totalCount: number;
    notes?: Record<string, string>;
  }): Promise<RazorpaySubscriptionInfo> {
    this.assertConfigured();
    const sub = await this.client.subscriptions.create({
      plan_id: params.planId,
      total_count: params.totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: params.notes,
    });
    this.logger.log(`Razorpay subscription created: ${sub.id}`);
    return sub as unknown as RazorpaySubscriptionInfo;
  }

  async fetchSubscription(id: string): Promise<RazorpaySubscriptionInfo> {
    this.assertConfigured();
    return (await this.client.subscriptions.fetch(id)) as unknown as RazorpaySubscriptionInfo;
  }

  async cancelSubscription(id: string): Promise<RazorpaySubscriptionInfo> {
    this.assertConfigured();
    return (await this.client.subscriptions.cancel(id, false)) as unknown as RazorpaySubscriptionInfo;
  }

  async pauseSubscription(id: string): Promise<RazorpaySubscriptionInfo> {
    this.assertConfigured();
    return (await this.client.subscriptions.pause(id, {
      pause_at: 'now',
    })) as unknown as RazorpaySubscriptionInfo;
  }

  async resumeSubscription(id: string): Promise<RazorpaySubscriptionInfo> {
    this.assertConfigured();
    return (await this.client.subscriptions.resume(id, {
      resume_at: 'now',
    })) as unknown as RazorpaySubscriptionInfo;
  }

  /** Checkout signs subscription payments as `payment_id|subscription_id` (order payments use the reverse). */
  verifySubscriptionSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    this.assertConfigured();
    const expected = createHmac('sha256', this.keySecret)
      .update(`${paymentId}|${subscriptionId}`)
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

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn(
        'Razorpay webhook secret (RAZORPAY_WEBHOOK_SECRET) is not configured.',
      );
      return false;
    }
    if (!signature) {
      return false;
    }
    const bodyString = Buffer.isBuffer(rawBody)
      ? rawBody.toString('utf8')
      : String(rawBody);
    const expected = createHmac('sha256', this.webhookSecret)
      .update(bodyString)
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

  getWebhookSecret(): string {
    return this.webhookSecret;
  }

  private assertConfigured() {
    if (!this.keyId || !this.keySecret) {
      throw new InternalServerErrorException(
        'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      );
    }
  }
}
