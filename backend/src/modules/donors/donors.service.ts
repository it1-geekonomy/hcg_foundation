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
import { ContentStatus } from '../../common/enums/content-status.enum';
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
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { ListSubscriptionsQueryDto } from './dto/list-subscriptions-query.dto';
import { Donor } from './entities/donor.entity';
import { DonorCounterSettings } from './entities/donor-counter-settings.entity';
import { UpdateDonorCounterSettingsDto } from './dto/update-donor-counter-settings.dto';
import { DonorSubscription } from './entities/donor-subscription.entity';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
import { SubscriptionPeriod } from '../../common/enums/subscription-period.enum';
import { PatientStory } from '../patient-stories/entities/patient-story.entity';
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

export type SubscriptionCheckout = {
  subscriptionId: string;
  amount: string;
  amountPaise: number;
  currency: string;
  period: SubscriptionPeriod;
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
    @InjectRepository(PatientStory)
    private readonly patientStoryRepo: Repository<PatientStory>,
    @InjectRepository(DonorCounterSettings)
    private readonly counterSettingsRepo: Repository<DonorCounterSettings>,
    @InjectRepository(DonorSubscription)
    private readonly subscriptionRepo: Repository<DonorSubscription>,
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
    const donationCategory = dto.patientStoryId
      ? (dto.donationCategory || DonationCategory.PATIENT_SPECIFIC)
      : (dto.donationCategory || DonationCategory.GENERAL_FUNDS);

    let patientStoryId: string | null = null;
    if (dto.patientStoryId) {
      const story = await this.patientStoryRepo.findOne({
        where: { id: dto.patientStoryId },
      });
      if (!story) {
        throw new NotFoundException('Patient story not found.');
      }
      if (story.status !== ContentStatus.PUBLISHED) {
        throw new BadRequestException('Patient story is not published.');
      }
      if (!story.isDonationEnabled) {
        throw new BadRequestException(
          'Donations are currently not enabled for this patient.',
        );
      }
      patientStoryId = story.id;

    }
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
          patientStoryId: patientStoryId ? this.note(patientStoryId, 50) : '',
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

    // Fetch live payment details from Razorpay to verify capture status
    let payment: any = null;
    try {
      payment = await this.razorpay.fetchPayment(dto.razorpayPaymentId);
    } catch (err) {
      const reason = this.razorpayErrorReason(err);
      this.logger.error(
        `Could not fetch payment ${dto.razorpayPaymentId} during verification: ${reason}`,
      );
      throw new BadRequestException(
        `Could not verify payment status with gateway: ${reason}`,
      );
    }

    if (!payment) {
      throw new BadRequestException(
        'Payment details could not be retrieved from Razorpay.',
      );
    }

    // If payment is authorized, attempt to capture it immediately
    if (payment.status === 'authorized') {
      this.logger.log(
        `Payment ${dto.razorpayPaymentId} is authorized. Auto-capturing on Razorpay...`,
      );
      try {
        await this.razorpay.capturePayment(
          dto.razorpayPaymentId,
          Number(payment.amount),
          payment.currency || 'INR',
        );
        // Refresh payment status after capture attempt
        payment = await this.razorpay.fetchPayment(dto.razorpayPaymentId);
      } catch (err) {
        const reason = this.razorpayErrorReason(err);
        this.logger.error(
          `Failed to capture authorized payment ${dto.razorpayPaymentId}: ${reason}`,
        );
        throw new BadRequestException(
          `Payment authorization succeeded, but payment capture failed (${reason}). The donation cannot be confirmed until captured.`,
        );
      }
    }

    // Strictly ensure status is 'captured' before granting PAID status and sending tax receipt
    if (payment.status !== 'captured') {
      this.logger.warn(
        `Payment ${dto.razorpayPaymentId} status is '${payment.status}', not 'captured'. Refusing to mark PAID.`,
      );
      throw new BadRequestException(
        `Payment status on gateway is '${payment.status}'. Donations can only be confirmed once successfully captured.`,
      );
    }

    const existing = await this.repo.findOne({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });
    if (existing?.status === DonationStatus.PAID) {
      return existing;
    }

    const order = await this.razorpay.fetchOrder(dto.razorpayOrderId);
    const notes = order.notes ?? {};
    const patientStoryId = notes.patientStoryId?.trim() || null;

    if (existing) {
      existing.status = DonationStatus.PAID;
      existing.razorpayPaymentId = dto.razorpayPaymentId;
      existing.receiptNumber =
        existing.receiptNumber || this.buildReceiptNumber(existing.id);
      if (!existing.patientStoryId && patientStoryId) {
        existing.patientStoryId = patientStoryId;
      }
      Object.assign(existing, DonationEmailQueueService.queuedFields());
      const saved = await this.repo.save(existing);
      this.logger.log(
        `Donation paid. donor=${saved.id} receipt=${saved.receiptNumber}`,
      );
      this.emailQueue.kick();
      return saved;
    }

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
        donationCategory:
          (notes.donationCategory as DonationCategory) ||
          (patientStoryId ? DonationCategory.PATIENT_SPECIFIC : DonationCategory.GENERAL_FUNDS),
        amount,
        currency: notes.currency || order.currency || 'INR',
        status: DonationStatus.PAID,
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
        patientStoryId: patientStoryId || null,
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

    if (query.patientStoryId) {
      qb.andWhere('donor.patientStoryId = :patientStoryId', {
        patientStoryId: query.patientStoryId,
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
    const entity = await this.repo
      .createQueryBuilder('donor')
      .leftJoin('donor.patientStory', 'patientStory')
      .addSelect(['patientStory.id', 'patientStory.title', 'patientStory.slug'])
      .where('donor.id = :id', { id })
      .getOne();

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

  async syncAll(): Promise<{ synced: number; updated: number }> {
    const donors = await this.repo.find();
    let updated = 0;
    for (const donor of donors) {
      if (donor.razorpayPaymentId || donor.razorpayOrderId) {
        const prevStatus = donor.status;
        try {
          const res = await this.syncPaymentStatus(donor.id);
          if (res.status !== prevStatus) {
            updated++;
          }
        } catch (err) {
          this.logger.warn(
            `Could not sync donor ${donor.id}: ${this.razorpayErrorReason(err)}`,
          );
        }
      }
    }
    this.logger.log(`SyncAll complete: ${donors.length} donors checked, ${updated} updated.`);
    return { synced: donors.length, updated };
  }

  async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionCheckout> {
    const amount = dto.amount.toFixed(2);
    const amountMinor = toMinorUnits(dto.amount);
    const fullName = dto.fullName.trim();
    const phone = dto.phone;
    const email = dto.email.toLowerCase().trim();
    const city = dto.city?.trim() || '';
    const countryCode = dto.countryCode?.trim().toUpperCase() || 'IN';
    const country = dto.country?.trim() || 'India';
    const isInternational = this.resolveInternational(
      country,
      countryCode,
      dto.isInternational,
    );
    const period = dto.period || SubscriptionPeriod.MONTHLY;
    const currency = 'INR';

    // Map frequency into Razorpay plan attributes:
    // Razorpay API only accepts 'daily' | 'weekly' | 'monthly' | 'yearly'.
    // Quarterly is represented as period='monthly' with interval=3.
    let rzpPeriod: 'monthly' | 'yearly' = 'monthly';
    let rzpInterval = 1;
    let totalCount = 60; // 5 years
    let periodLabel = 'month';

    if (period === SubscriptionPeriod.YEARLY) {
      rzpPeriod = 'yearly';
      rzpInterval = 1;
      totalCount = 5; // 5 years
      periodLabel = 'year';
    } else if (period === SubscriptionPeriod.QUARTERLY) {
      rzpPeriod = 'monthly';
      rzpInterval = 3;
      totalCount = 20; // 5 years (20 quarters)
      periodLabel = 'quarter';
    } else {
      rzpPeriod = 'monthly';
      rzpInterval = 1;
      totalCount = 60; // 5 years (60 months)
      periodLabel = 'month';
    }

    let patientStoryId: string | null = null;
    if (dto.patientStoryId) {
      const story = await this.patientStoryRepo.findOne({
        where: { id: dto.patientStoryId },
      });
      if (!story) {
        throw new NotFoundException('Patient story not found.');
      }
      if (story.status !== ContentStatus.PUBLISHED) {
        throw new BadRequestException('Patient story is not published.');
      }
      if (!story.isDonationEnabled) {
        throw new BadRequestException(
          'Donations are currently not enabled for this patient.',
        );
      }
      patientStoryId = story.id;
    }

    const donationCategory = patientStoryId
      ? (dto.donationCategory || DonationCategory.PATIENT_SPECIFIC)
      : (dto.donationCategory || DonationCategory.GENERAL_FUNDS);

    try {
      // 1. Create or link customer on Razorpay
      const customer = await this.razorpay.createCustomer({
        name: fullName,
        email,
        contact: phone,
      });

      // 2. Check for an existing Razorpay Plan or create a new one
      let planId: string | null = null;
      const existingPlan = await this.subscriptionRepo
        .createQueryBuilder('sub')
        .where('sub.amount = :amount', { amount })
        .andWhere('sub.period = :period', { period })
        .andWhere('sub.currency = :currency', { currency })
        .andWhere('sub.razorpayPlanId IS NOT NULL')
        .orderBy('sub.createdAt', 'DESC')
        .getOne();

      if (existingPlan?.razorpayPlanId) {
        planId = existingPlan.razorpayPlanId;
        this.logger.log(
          `Reusing existing Razorpay plan ${planId} for ₹${amount}/${periodLabel}`,
        );
      } else {
        const plan = await this.razorpay.createPlan({
          period: rzpPeriod,
          interval: rzpInterval,
          name: `HCG Foundation Donation - ₹${amount}/${periodLabel}`,
          amountPaise: amountMinor,
          currency,
          description: patientStoryId
            ? `Recurring donation for patient story #${patientStoryId}`
            : 'HCG Foundation recurring donation',
        });
        planId = plan.id;
        this.logger.log(
          `Created new Razorpay plan ${planId} for ₹${amount}/${periodLabel}`,
        );
      }

      // 3. Create Subscription on Razorpay
      const rzpSub = await this.razorpay.createSubscription({
        planId,
        totalCount,
        customerId: customer.id,
        notes: {
          fullName: this.note(fullName),
          phone: this.note(phone, 20),
          email: this.note(email),
          city: this.note(city),
          country: this.note(country, 100),
          countryCode: this.note(countryCode, 8),
          international: isInternational ? 'true' : 'false',
          pan: this.note(dto.pan || '', 20),
          donationCategory: this.note(donationCategory, 255),
          patientStoryId: patientStoryId ? this.note(patientStoryId, 50) : '',
          amount,
          period,
        },
      });

      // 4. Save subscription record in DB
      await this.subscriptionRepo.save(
        this.subscriptionRepo.create({
          fullName,
          phone,
          email,
          city: city || null,
          country,
          countryCode,
          isInternational,
          pan: dto.pan?.trim() || null,
          amount,
          currency,
          period,
          donationCategory,
          patientStoryId,
          razorpayCustomerId: customer.id,
          razorpayPlanId: planId,
          razorpaySubscriptionId: rzpSub.id,
          status: SubscriptionStatus.CREATED,
          totalCount,
          paidCount: 0,
        }),
      );

      return {
        subscriptionId: rzpSub.id,
        amount,
        amountPaise: amountMinor,
        currency,
        period,
        keyId: this.razorpay.getKeyId(),
        name: fullName,
        email,
        phone,
        isInternational,
        countryCode,
      };
    } catch (err) {
      const reason = this.razorpayErrorReason(err);
      this.logger.error(`Razorpay subscription creation failed: ${reason}`);
      throw new BadRequestException(
        `Could not initiate recurring donation: ${reason}`,
      );
    }
  }

  async verifySubscription(
    dto: VerifySubscriptionDto,
  ): Promise<{ subscription: DonorSubscription; donation: Donor }> {
    const isValid = this.razorpay.verifySubscriptionSignature(
      dto.razorpaySubscriptionId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!isValid) {
      this.logger.warn(
        `Invalid subscription signature for sub=${dto.razorpaySubscriptionId} payment=${dto.razorpayPaymentId}`,
      );
      throw new BadRequestException('Payment verification failed.');
    }

    const sub = await this.subscriptionRepo.findOne({
      where: { razorpaySubscriptionId: dto.razorpaySubscriptionId },
    });
    if (!sub) {
      throw new NotFoundException('Subscription record not found.');
    }

    sub.status = SubscriptionStatus.ACTIVE;
    sub.paidCount = Math.max(sub.paidCount, 1);
    const savedSub = await this.subscriptionRepo.save(sub);

    // Create the first recurring donation record in donors table
    let donation = await this.repo.findOne({
      where: { razorpayPaymentId: dto.razorpayPaymentId },
    });

    if (!donation) {
      donation = await this.repo.save(
        this.repo.create({
          fullName: sub.fullName,
          phone: sub.phone,
          email: sub.email,
          city: sub.city,
          country: sub.country,
          countryCode: sub.countryCode,
          isInternational: sub.isInternational,
          pan: sub.pan,
          donationCategory: sub.donationCategory,
          amount: sub.amount,
          currency: sub.currency,
          status: DonationStatus.PAID,
          razorpayPaymentId: dto.razorpayPaymentId,
          razorpaySubscriptionId: sub.razorpaySubscriptionId,
          subscriptionId: sub.id,
          patientStoryId: sub.patientStoryId,
        }),
      );
      donation.receiptNumber = this.buildReceiptNumber(donation.id);
      Object.assign(donation, DonationEmailQueueService.queuedFields());
      donation = await this.repo.save(donation);
      this.logger.log(
        `Subscription first donation paid: donor=${donation.id} sub=${sub.id} receipt=${donation.receiptNumber}`,
      );
      this.emailQueue.kick();
    }

    return { subscription: savedSub, donation };
  }

  async findAllSubscriptions(
    query: ListSubscriptionsQueryDto,
  ): Promise<PaginatedResult<DonorSubscription>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.subscriptionRepo
      .createQueryBuilder('sub')
      .leftJoin('sub.patientStory', 'patientStory')
      .addSelect(['patientStory.id', 'patientStory.title', 'patientStory.slug'])
      .orderBy('sub.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('sub.status = :status', { status: query.status });
    }

    if (query.period) {
      qb.andWhere('sub.period = :period', { period: query.period });
    }

    if (query.patientStoryId) {
      qb.andWhere('sub.patientStoryId = :patientStoryId', {
        patientStoryId: query.patientStoryId,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(sub.fullName ILIKE :search OR sub.email ILIKE :search OR sub.phone ILIKE :search OR sub.razorpaySubscriptionId ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginatedResult(data, total, page, limit);
  }

  async findOneSubscription(id: string): Promise<DonorSubscription> {
    const sub = await this.subscriptionRepo
      .createQueryBuilder('sub')
      .leftJoin('sub.patientStory', 'patientStory')
      .addSelect(['patientStory.id', 'patientStory.title', 'patientStory.slug'])
      .leftJoinAndSelect('sub.donations', 'donations')
      .where('sub.id = :id', { id })
      .orderBy('donations.createdAt', 'DESC')
      .getOne();

    if (!sub) {
      throw new NotFoundException(`Subscription not found for id "${id}".`);
    }
    return sub;
  }

  async cancelSubscription(id: string): Promise<DonorSubscription> {
    const sub = await this.subscriptionRepo.findOne({ where: { id } });
    if (!sub) {
      throw new NotFoundException(`Subscription not found for id "${id}".`);
    }

    try {
      await this.razorpay.cancelSubscription(sub.razorpaySubscriptionId, false);
    } catch (err) {
      const reason = this.razorpayErrorReason(err);
      this.logger.error(`Could not cancel Razorpay subscription: ${reason}`);
      throw new BadRequestException(`Failed to cancel subscription with gateway: ${reason}`);
    }

    sub.status = SubscriptionStatus.CANCELLED;
    sub.endedAt = new Date();
    return await this.subscriptionRepo.save(sub);
  }

  private async handleSubscriptionWebhookEvent(
    eventName: string,
    payload: any,
  ): Promise<{ received: boolean; event: string; message?: string }> {
    const subEntity = payload.subscription?.entity;
    const paymentEntity = payload.payment?.entity;
    const subId: string | undefined = subEntity?.id;

    if (!subId) {
      this.logger.warn(`Subscription webhook ${eventName} missing subscription id`);
      return { received: true, event: eventName, message: 'Missing subscription id' };
    }

    const sub = await this.subscriptionRepo.findOne({
      where: { razorpaySubscriptionId: subId },
    });

    if (!sub) {
      this.logger.warn(`Subscription ${subId} not found in database for event ${eventName}`);
      return { received: true, event: eventName, message: 'Subscription not found' };
    }

    // 1. Subscription Activated / Authenticated
    if (eventName === 'subscription.activated' || eventName === 'subscription.authenticated') {
      sub.status = SubscriptionStatus.ACTIVE;
      if (subEntity.current_start) sub.currentStart = new Date(subEntity.current_start * 1000);
      if (subEntity.current_end) sub.currentEnd = new Date(subEntity.current_end * 1000);
      await this.subscriptionRepo.save(sub);
      this.logger.log(`Subscription ${sub.id} marked ACTIVE via webhook (${eventName})`);
      return { received: true, event: eventName };
    }

    // 2. Subscription Charged (Monthly/Quarterly/Yearly Automatic Collection)
    if (eventName === 'subscription.charged') {
      sub.status = SubscriptionStatus.ACTIVE;
      sub.paidCount = subEntity.paid_count ?? (sub.paidCount + 1);
      if (subEntity.current_start) sub.currentStart = new Date(subEntity.current_start * 1000);
      if (subEntity.current_end) sub.currentEnd = new Date(subEntity.current_end * 1000);
      await this.subscriptionRepo.save(sub);

      const paymentId = paymentEntity?.id;
      if (paymentId) {
        const existing = await this.repo.findOne({
          where: { razorpayPaymentId: paymentId },
        });

        if (!existing) {
          const amount = paymentEntity?.amount
            ? (Number(paymentEntity.amount) / 100).toFixed(2)
            : sub.amount;

          const donor = await this.repo.save(
            this.repo.create({
              fullName: sub.fullName,
              phone: sub.phone,
              email: sub.email,
              city: sub.city,
              country: sub.country,
              countryCode: sub.countryCode,
              isInternational: sub.isInternational,
              pan: sub.pan,
              donationCategory: sub.donationCategory,
              amount,
              currency: paymentEntity?.currency || sub.currency,
              status: DonationStatus.PAID,
              razorpayPaymentId: paymentId,
              razorpaySubscriptionId: sub.razorpaySubscriptionId,
              subscriptionId: sub.id,
              patientStoryId: sub.patientStoryId,
            }),
          );
          donor.receiptNumber = this.buildReceiptNumber(donor.id);
          Object.assign(donor, DonationEmailQueueService.queuedFields());
          await this.repo.save(donor);
          this.logger.log(
            `Recurring donation recorded: donor=${donor.id} receipt=${donor.receiptNumber}`,
          );
          this.emailQueue.kick();
        }
      }
      return { received: true, event: eventName };
    }

    // 3. Subscription Halted
    if (eventName === 'subscription.halted') {
      sub.status = SubscriptionStatus.HALTED;
      await this.subscriptionRepo.save(sub);
      this.logger.warn(`Subscription ${sub.id} HALTED via webhook`);
      return { received: true, event: eventName };
    }

    // 4. Subscription Cancelled
    if (eventName === 'subscription.cancelled') {
      sub.status = SubscriptionStatus.CANCELLED;
      sub.endedAt = new Date();
      await this.subscriptionRepo.save(sub);
      this.logger.log(`Subscription ${sub.id} CANCELLED via webhook`);
      return { received: true, event: eventName };
    }

    // 5. Subscription Completed
    if (eventName === 'subscription.completed') {
      sub.status = SubscriptionStatus.COMPLETED;
      sub.endedAt = new Date();
      await this.subscriptionRepo.save(sub);
      this.logger.log(`Subscription ${sub.id} COMPLETED via webhook`);
      return { received: true, event: eventName };
    }

    return { received: true, event: eventName };
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

    // Handle subscription-specific webhook events
    if (eventName && eventName.startsWith('subscription.')) {
      return await this.handleSubscriptionWebhookEvent(eventName, payload);
    }

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

  private getCurrentMonthInfo(): {
    year: number;
    month: number;
    monthName: string;
  } {
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

    return {
      year,
      month,
      monthName: MONTH_NAMES[month - 1] ?? '',
    };
  }

  async getCounterSettings(): Promise<DonorCounterSettings> {
    const [existing] = await this.counterSettingsRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (existing) {
      return existing;
    }
    return await this.counterSettingsRepo.save(
      this.counterSettingsRepo.create({ count: 0 }),
    );
  }

  async updateCounterSettings(
    dto: UpdateDonorCounterSettingsDto,
  ): Promise<DonorCounterSettings> {
    const [existing] = await this.counterSettingsRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    const settings =
      existing ?? this.counterSettingsRepo.create({ count: dto.count });
    settings.count = dto.count;
    return await this.counterSettingsRepo.save(settings);
  }

  async getCurrentMonthCount(): Promise<CurrentMonthDonorCount> {
    const { year, month, monthName } = this.getCurrentMonthInfo();

    const [settings] = await this.counterSettingsRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });

    return {
      count: settings?.count ?? 0,
      month,
      year,
      monthName,
    };
  }
}
