import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RazorpayService } from '../../common/payments/razorpay.service';
import { DonationStatus } from '../../common/enums/donation-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import {
  normalizeDonationCurrency,
  toMinorUnits,
} from './donation-currency';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ListDonorsQueryDto } from './dto/list-donors-query.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { Donor } from './entities/donor.entity';
import { DonationEmailQueueService } from './donation-email-queue.service';
import { DonationCategory } from '../../common/enums/donation-category.enum';

export type DonationCheckout = {
  orderId: string;
  amount: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  name: string;
  email: string;
  phone: string;
  isInternational: boolean;
  countryCode: string | null;
};

export interface CurrentMonthDonorCount {
  count: number;
  month: number;
  year: number;
  monthName: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

@Injectable()
export class DonorsService {
  private readonly logger = new Logger(DonorsService.name);

  constructor(
    @InjectRepository(Donor)
    private readonly repo: Repository<Donor>,
    private readonly razorpay: RazorpayService,
    private readonly emailQueue: DonationEmailQueueService,
  ) { }

  async createOrder(dto: CreateDonationDto): Promise<DonationCheckout> {
    const amount = dto.amount.toFixed(2);
    const amountMinor = toMinorUnits(dto.amount);
    const fullName = dto.fullName.trim();
    const phone = dto.phone;
    const email = dto.email.toLowerCase().trim();
    const city = dto.city?.trim() || '';
    const countryCode = dto.countryCode?.trim().toUpperCase() || null;
    const country = dto.country?.trim() || 'India';
    const isInternational = this.resolveInternational(
      country,
      countryCode,
      dto.isInternational,
    );
    const currency = normalizeDonationCurrency(dto.currency, isInternational);
    const pan = isInternational ? '' : dto.pan?.trim() || '';
    const message = dto.message?.trim() || '';
    const donationCategory = dto.donationCategory || DonationCategory.GENERAL_FUNDS;

    if (!isInternational && currency !== 'INR') {
      throw new BadRequestException(
        'Indian donations must use INR. Change country or currency.',
      );
    }

    try {
      const order = await this.razorpay.createOrder({
        amountPaise: amountMinor,
        currency,
        receipt: `hcg_${Date.now().toString(36)}`.slice(0, 40),
        notes: {
          fullName: this.note(fullName),
          phone: this.note(phone, 20),
          email: this.note(email),
          city: this.note(city),
          country: this.note(country, 100),
          countryCode: this.note(countryCode || '', 8),
          international: isInternational ? 'true' : 'false',
          pan: this.note(pan, 20),
          message: this.note(message),
          donationCategory: this.note(donationCategory, 255),
          amount,
          currency,
        },
      });

      return {
        orderId: order.id,
        amount,
        amountPaise: amountMinor,
        currency,
        keyId: this.razorpay.getKeyId(),
        name: fullName,
        email,
        phone,
        isInternational,
        countryCode,
      };
    } catch (err) {
      const reason = this.razorpayErrorReason(err);
      this.logger.error(
        `Razorpay order failed (${currency} ${amount}, international=${isInternational}): ${reason}`,
      );
      if (currency !== 'INR' && /currency|international/i.test(reason)) {
        throw new BadRequestException(
          `Donations in ${currency} are not available right now. Please donate in INR or contact us.`,
        );
      }
      throw new BadRequestException(
        'Could not start payment. Please try again.',
      );
    }
  }

  /** The Razorpay SDK rejects with `{ statusCode, error: { code, description } }`, not an Error. */
  private razorpayErrorReason(err: unknown): string {
    if (err instanceof Error) return err.message;
    const e = err as {
      statusCode?: number;
      error?: { code?: string; description?: string; field?: string };
    };
    const parts = [
      e?.statusCode ? `HTTP ${e.statusCode}` : '',
      e?.error?.code ?? '',
      e?.error?.description ?? '',
      e?.error?.field ? `(field: ${e.error.field})` : '',
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : JSON.stringify(err ?? 'unknown error');
  }

  async verifyPayment(dto: VerifyDonationDto): Promise<Donor> {
    const valid = this.razorpay.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!valid) {
      throw new BadRequestException(
        'Payment signature is invalid. Donation was not confirmed.',
      );
    }

    // Ensure payment is captured on Razorpay so it is not auto-refunded after 2 days
    try {
      const payment = await this.razorpay.fetchPayment(dto.razorpayPaymentId);
      if (payment && payment.status === 'authorized') {
        this.logger.log(
          `Payment ${dto.razorpayPaymentId} is authorized. Auto-capturing on Razorpay...`,
        );
        await this.razorpay.capturePayment(
          dto.razorpayPaymentId,
          Number(payment.amount),
          payment.currency || 'INR',
        );
      }
    } catch (err) {
      this.logger.warn(
        `Failed to check/capture payment ${dto.razorpayPaymentId}: ${this.razorpayErrorReason(err)}`,
      );
    }

    const existing = await this.repo.findOne({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });
    if (existing?.status === DonationStatus.PAID) {
      return existing;
    }

    if (existing) {
      existing.status = DonationStatus.PAID;
      existing.razorpayPaymentId = dto.razorpayPaymentId;
      existing.receiptNumber =
        existing.receiptNumber || this.buildReceiptNumber(existing.id);
      Object.assign(existing, DonationEmailQueueService.queuedFields());
      const saved = await this.repo.save(existing);
      this.logger.log(
        `Donation paid. donor=${saved.id} receipt=${saved.receiptNumber}`,
      );
      this.emailQueue.kick();
      return saved;
    }

    const order = await this.razorpay.fetchOrder(dto.razorpayOrderId);
    const notes = order.notes ?? {};
    const country = notes.country?.trim() || 'India';
    const countryCode = notes.countryCode?.trim().toUpperCase() || null;
    const amount =
      notes.amount || (Number(order.amount) / 100).toFixed(2);

    const donor = await this.repo.save(
      this.repo.create({
        fullName: notes.fullName?.trim() || 'Donor',
        phone: notes.phone || null,
        email: notes.email?.toLowerCase().trim() || null,
        city: notes.city?.trim() || null,
        country,
        countryCode,
        isInternational: notes.international === 'true',
        pan: notes.pan?.trim() || null,
        message: notes.message?.trim() || null,
        donationCategory: (notes.donationCategory as DonationCategory) || DonationCategory.GENERAL_FUNDS,
        amount,
        currency: notes.currency || order.currency || 'INR',
        status: DonationStatus.PAID,
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
      }),
    );
    donor.receiptNumber = this.buildReceiptNumber(donor.id);
    Object.assign(donor, DonationEmailQueueService.queuedFields());
    const saved = await this.repo.save(donor);
    this.logger.log(
      `Donation paid. donor=${saved.id} receipt=${saved.receiptNumber}`,
    );
    this.emailQueue.kick();
    return saved;
  }

  async findAll(query: ListDonorsQueryDto): Promise<PaginatedResult<Donor>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('donor')
      .orderBy('donor.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('donor.status = :status', {
        status: query.status,
      });
    }

    if (query.donationCategory) {
      qb.andWhere('donor.donationCategory = :donationCategory', {
        donationCategory: query.donationCategory,
      });
    }

    if (query.receiptEmailStatus) {
      qb.andWhere('donor.receiptEmailStatus = :receiptEmailStatus', {
        receiptEmailStatus: query.receiptEmailStatus,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(donor.fullName ILIKE :search OR donor.email ILIKE :search OR donor.phone ILIKE :search OR donor.receiptNumber ILIKE :search OR donor.country ILIKE :search OR donor.countryCode ILIKE :search OR donor.city ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Donor> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Donor not found for id "${id}". Check the id and try again.`,
      );
    }
    return entity;
  }

  async syncPaymentStatus(id: string): Promise<Donor> {
    const donor = await this.findOne(id);
    if (!donor.razorpayPaymentId && !donor.razorpayOrderId) {
      throw new BadRequestException(
        'This donation has no Razorpay payment ID or order ID to sync.',
      );
    }

    let paymentData: any = null;
    if (donor.razorpayPaymentId) {
      try {
        paymentData = await this.razorpay.fetchPayment(donor.razorpayPaymentId);
      } catch (err) {
        const reason = this.razorpayErrorReason(err);
        this.logger.error(
          `Failed to fetch payment ${donor.razorpayPaymentId} from Razorpay: ${reason}`,
        );
        throw new BadRequestException(
          `Could not fetch payment from Razorpay: ${reason}`,
        );
      }
    }

    if (paymentData) {
      const razorpayStatus = String(paymentData.status || '').toLowerCase();
      const amountRefunded = Number(paymentData.amount_refunded || 0);

      if (razorpayStatus === 'refunded' || amountRefunded > 0) {
        donor.status = DonationStatus.REFUNDED;
      } else if (razorpayStatus === 'captured') {
        donor.status = DonationStatus.PAID;
      } else if (razorpayStatus === 'failed') {
        donor.status = DonationStatus.FAILED;
      } else if (razorpayStatus === 'authorized') {
        const payId = String(paymentData.id || donor.razorpayPaymentId);
        try {
          await this.razorpay.capturePayment(
            payId,
            Number(paymentData.amount),
            paymentData.currency || 'INR',
          );
          donor.status = DonationStatus.PAID;
        } catch (err) {
          this.logger.warn(
            `Could not capture authorized payment during sync: ${this.razorpayErrorReason(err)}`,
          );
        }
      }

      if (paymentData.order_id && !donor.razorpayOrderId) {
        donor.razorpayOrderId = String(paymentData.order_id);
      }

      const updated = await this.repo.save(donor);
      this.logger.log(
        `Donor ${donor.id} synced with Razorpay: new status=${updated.status}`,
      );
      return updated;
    }

    if (donor.razorpayOrderId) {
      try {
        const orderData = await this.razorpay.fetchOrder(donor.razorpayOrderId);
        if (
          orderData &&
          (orderData as any).status === 'paid' &&
          donor.status !== DonationStatus.PAID
        ) {
          donor.status = DonationStatus.PAID;
          donor.receiptNumber =
            donor.receiptNumber || this.buildReceiptNumber(donor.id);
          Object.assign(donor, DonationEmailQueueService.queuedFields());
          const updated = await this.repo.save(donor);
          this.emailQueue.kick();
          return updated;
        }
      } catch (err) {
        const reason = this.razorpayErrorReason(err);
        throw new BadRequestException(
          `Could not fetch order from Razorpay: ${reason}`,
        );
      }
    }

    return donor;
  }

  async handleRazorpayWebhook(
    rawBody: string | Buffer,
    signature: string,
  ): Promise<{ received: boolean; event?: string; message?: string }> {
    if (!signature) {
      throw new BadRequestException('Missing x-razorpay-signature header');
    }

    const isValid = this.razorpay.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      this.logger.warn('Razorpay webhook signature verification failed.');
      throw new BadRequestException('Invalid webhook signature');
    }

    const rawString = Buffer.isBuffer(rawBody)
      ? rawBody.toString('utf8')
      : String(rawBody);

    let body: any;
    try {
      body = JSON.parse(rawString);
    } catch {
      throw new BadRequestException('Invalid JSON payload in webhook');
    }

    const eventName: string = body.event;
    this.logger.log(`Received Razorpay webhook event: ${eventName}`);

    const payload = body.payload ?? {};
    const paymentEntity = payload.payment?.entity;
    const refundEntity = payload.refund?.entity;

    const paymentId: string | undefined =
      refundEntity?.payment_id || paymentEntity?.id;
    const orderId: string | undefined = paymentEntity?.order_id;

    if (!paymentId && !orderId) {
      this.logger.warn(
        `Webhook ${eventName} received without payment_id or order_id`,
      );
      return { received: true, event: eventName };
    }

    // Find donor by payment ID or order ID
    let donor: Donor | null = null;
    if (paymentId) {
      donor = await this.repo.findOne({
        where: { razorpayPaymentId: paymentId },
      });
    }
    if (!donor && orderId) {
      donor = await this.repo.findOne({
        where: { razorpayOrderId: orderId },
      });
    }

    if (!donor) {
      this.logger.warn(
        `No donor found for webhook ${eventName} (payment=${paymentId}, order=${orderId})`,
      );
      return {
        received: true,
        event: eventName,
        message: 'No matching donor record found',
      };
    }

    // Handle refunds
    if (
      eventName === 'refund.processed' ||
      eventName === 'refund.created' ||
      eventName === 'payment.refunded'
    ) {
      donor.status = DonationStatus.REFUNDED;
      if (paymentId && !donor.razorpayPaymentId) {
        donor.razorpayPaymentId = paymentId;
      }
      await this.repo.save(donor);
      this.logger.log(
        `Donor ${donor.id} updated to REFUNDED via webhook (${eventName})`,
      );
      return { received: true, event: eventName };
    }

    // Handle payment failed
    if (eventName === 'payment.failed') {
      if (donor.status !== DonationStatus.PAID) {
        donor.status = DonationStatus.FAILED;
        await this.repo.save(donor);
        this.logger.log(
          `Donor ${donor.id} updated to FAILED via webhook (${eventName})`,
        );
      }
      return { received: true, event: eventName };
    }

    // Handle payment authorized (auto-capture immediately so Razorpay does not auto-refund after 2 days)
    if (eventName === 'payment.authorized') {
      if (paymentId) {
        try {
          const amount = paymentEntity?.amount ? Number(paymentEntity.amount) : 0;
          const currency = paymentEntity?.currency || 'INR';
          if (amount > 0) {
            this.logger.log(`Webhook payment.authorized: Capturing ${paymentId}...`);
            await this.razorpay.capturePayment(paymentId, amount, currency);
          }
        } catch (err) {
          this.logger.error(
            `Webhook capture failed for ${paymentId}: ${this.razorpayErrorReason(err)}`,
          );
        }
        if (donor.status !== DonationStatus.PAID) {
          donor.status = DonationStatus.PAID;
          if (!donor.razorpayPaymentId) {
            donor.razorpayPaymentId = paymentId;
          }
          donor.receiptNumber =
            donor.receiptNumber || this.buildReceiptNumber(donor.id);
          Object.assign(donor, DonationEmailQueueService.queuedFields());
          await this.repo.save(donor);
          this.logger.log(
            `Donor ${donor.id} updated to PAID via webhook (${eventName})`,
          );
          this.emailQueue.kick();
        }
      }
      return { received: true, event: eventName };
    }

    // Handle payment captured / order paid fallback
    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      if (donor.status !== DonationStatus.PAID) {
        donor.status = DonationStatus.PAID;
        if (paymentId && !donor.razorpayPaymentId) {
          donor.razorpayPaymentId = paymentId;
        }
        donor.receiptNumber =
          donor.receiptNumber || this.buildReceiptNumber(donor.id);
        Object.assign(donor, DonationEmailQueueService.queuedFields());
        await this.repo.save(donor);
        this.logger.log(
          `Donor ${donor.id} updated to PAID via webhook (${eventName})`,
        );
        this.emailQueue.kick();
      }
      return { received: true, event: eventName };
    }

    return { received: true, event: eventName };
  }

  private note(value: string, max = 256): string {
    return value.slice(0, max);
  }

  private resolveInternational(
    country: string | null,
    countryCode: string | null,
    flagged?: boolean,
  ): boolean {
    if (flagged === true) return true;
    if (flagged === false) return false;
    if (countryCode) return countryCode !== 'IN';
    if (!country) return false;
    return !/^india$/i.test(country);
  }

  private buildReceiptNumber(id: string): string {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `HCG-${stamp}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }

  async getCurrentMonthCount(): Promise<CurrentMonthDonorCount> {
    const now = new Date();
    const istParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
    }).formatToParts(now);

    const year = parseInt(
      istParts.find((p) => p.type === 'year')?.value || `${now.getFullYear()}`,
      10,
    );
    const month = parseInt(
      istParts.find((p) => p.type === 'month')?.value || `${now.getMonth() + 1}`,
      10,
    );

    const m = String(month).padStart(2, '0');
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextM = String(nextMonth).padStart(2, '0');

    // Asia/Kolkata (IST) is UTC+05:30
    const startDate = new Date(`${year}-${m}-01T00:00:00+05:30`);
    const endDate = new Date(`${nextYear}-${nextM}-01T00:00:00+05:30`);

    const count = await this.repo
      .createQueryBuilder('donor')
      .where('donor.status = :status', { status: DonationStatus.PAID })
      .andWhere('donor.createdAt >= :startDate AND donor.createdAt < :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    return {
      count,
      month,
      year,
      monthName: MONTH_NAMES[month - 1] ?? '',
    };
  }
}
