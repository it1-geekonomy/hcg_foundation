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

  
  verifySubscriptionSignature(
    subscriptionId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    this.assertConfigured();
    // Razorpay subscription signature format: payment_id + '|' + subscription_id
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

  async createCustomer(params: {
    name: string;
    email: string;
    contact?: string;
  }): Promise<{ id: string; name: string; email: string }> {
    this.assertConfigured();
    try {
      const customer = await (this.client as any).customers.create({
        name: params.name,
        email: params.email,
        contact: params.contact || undefined,
        fail_existing: '0',
      });
      return {
        id: String(customer.id),
        name: String(customer.name || params.name),
        email: String(customer.email || params.email),
      };
    } catch (err: any) {
      const errMsg = String(
        err?.message || err?.error?.description || err?.description || '',
      );
      if (
        errMsg.toLowerCase().includes('already exists') ||
        err?.statusCode === 400
      ) {
        // Fallback: Fetch existing customer from Razorpay by email or contact
        try {
          const list = await (this.client as any).customers.all({
            count: 100,
          });
          const match = list?.items?.find((c: any) => {
            const emailMatch =
              c.email &&
              params.email &&
              c.email.trim().toLowerCase() === params.email.trim().toLowerCase();
            const contactA = (c.contact || '').replace(/\D/g, '').slice(-10);
            const contactB = (params.contact || '').replace(/\D/g, '').slice(-10);
            const phoneMatch = contactA && contactB && contactA === contactB;
            return Boolean(emailMatch || phoneMatch);
          });
          if (match) {
            this.logger.log(
              `Found existing Razorpay customer ${match.id} for ${params.email || params.contact}`,
            );
            return {
              id: String(match.id),
              name: String(match.name || params.name),
              email: String(match.email || params.email),
            };
          }
        } catch (fetchErr) {
          this.logger.warn(`Could not lookup existing customer: ${fetchErr}`);
        }
      }
      this.logger.error(`Failed to create Razorpay customer: ${err?.message || err}`);
      throw err;
    }
  }

  async createPlan(params: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    name: string;
    amountPaise: number;
    currency?: string;
    description?: string;
  }): Promise<{ id: string; period: string; interval: number }> {
    this.assertConfigured();
    const plan = await (this.client as any).plans.create({
      period: params.period,
      interval: params.interval || 1,
      item: {
        name: params.name,
        amount: params.amountPaise,
        currency: params.currency || 'INR',
        description: params.description || undefined,
      },
    });
    this.logger.log(`Razorpay plan created: ${plan.id} (${params.period})`);
    return {
      id: String(plan.id),
      period: String(plan.period),
      interval: Number(plan.interval),
    };
  }

  async createSubscription(params: {
    planId: string;
    totalCount?: number;
    customerId?: string;
    quantity?: number;
    notes?: Record<string, string>;
  }): Promise<{ id: string; plan_id: string; status: string }> {
    this.assertConfigured();
    const sub = await (this.client as any).subscriptions.create({
      plan_id: params.planId,
      total_count: params.totalCount || 60,
      quantity: params.quantity || 1,
      customer_notify: 1,
      customer_id: params.customerId || undefined,
      notes: params.notes,
    });
    this.logger.log(`Razorpay subscription created: ${sub.id}`);
    return {
      id: String(sub.id),
      plan_id: String(sub.plan_id),
      status: String(sub.status),
    };
  }

  async fetchSubscription(subscriptionId: string): Promise<any> {
    this.assertConfigured();
    return await (this.client as any).subscriptions.fetch(subscriptionId);
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtCycleEnd = false,
  ): Promise<any> {
    this.assertConfigured();
    return await (this.client as any).subscriptions.cancel(
      subscriptionId,
      cancelAtCycleEnd,
    );
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
