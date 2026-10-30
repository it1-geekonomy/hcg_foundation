import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import {
  RazorpayService,
  type RazorpaySubscriptionInfo,
} from '../../common/payments/razorpay.service';
import { DonationStatus } from '../../common/enums/donation-status.enum';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/interfaces/paginated.interface';
import { DonationEmailQueueService } from './donation-email-queue.service';
import { DonorsService } from './donors.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsQueryDto } from './dto/list-subscriptions-query.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import {
  DonationSubscription,
  type DonationFrequency,
  SUBSCRIPTION_STATUSES,
  type SubscriptionStatus,
} from './entities/donation-subscription.entity';
import { Donor } from './entities/donor.entity';

/**
 * Razorpay needs a fixed number of charges per subscription; these cap each
 * mandate at roughly ten years.
 */
const FREQUENCY_PLANS: Record<
  DonationFrequency,
  { period: 'monthly' | 'yearly'; interval: number; totalCount: number; label: string }
> = {
  monthly: { period: 'monthly', interval: 1, totalCount: 120, label: 'Monthly' },
  quarterly: { period: 'monthly', interval: 3, totalCount: 40, label: 'Quarterly' },
  yearly: { period: 'yearly', interval: 1, totalCount: 10, label: 'Yearly' },
};

const ENDED_STATUSES: SubscriptionStatus[] = ['cancelled', 'completed', 'expired'];

export type SubscriptionCheckout = {
  subscriptionId: string;
  frequency: DonationFrequency;
  amount: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  name: string;
  email: string;
  phone: string;
};

export type SubscriptionVerifyResult = {
  subscription: DonationSubscription;
  /** The first charge, when Razorpay took it during checkout. */
  donor: Donor | null;
};

type PaymentEntity = {
  id: string;
  amount: number;
  currency?: string;
  status?: string;
  order_id?: string | null;
};

@Injectable()
export class DonationSubscriptionsService {
  private readonly logger = new Logger(DonationSubscriptionsService.name);

  constructor(
    @InjectRepository(DonationSubscription)
    private readonly repo: Repository<DonationSubscription>,
    @InjectRepository(Donor)
    private readonly donorRepo: Repository<Donor>,
    private readonly donors: DonorsService,
    private readonly razorpay: RazorpayService,
    private readonly emailQueue: DonationEmailQueueService,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<SubscriptionCheckout> {
    const d = await this.donors.prepareDonation(dto);
    if (d.isInternational || d.currency !== 'INR') {
      throw new BadRequestException(
        'Monthly, quarterly and yearly donations are available in INR only. Please choose One Time.',
      );
    }

    const schedule = FREQUENCY_PLANS[dto.frequency];
    try {
      const planId = await this.findOrCreatePlan(dto.frequency, d.amount, d.amountMinor);
      const sub = await this.razorpay.createSubscription({
        planId,
        totalCount: schedule.totalCount,
        notes: {
          fullName: d.fullName.slice(0, 256),
          email: d.email.slice(0, 256),
          frequency: dto.frequency,
          amount: d.amount,
        },
      });

      await this.repo.save(
        this.repo.create({
          fullName: d.fullName,
          phone: d.phone || null,
          email: d.email || null,
          city: d.city || null,
          pan: d.pan || null,
          message: d.message || null,
          donationCategory: d.donationCategory,
          patientStoryId: d.patientStoryId,
          frequency: dto.frequency,
          amount: d.amount,
          currency: 'INR',
          razorpayPlanId: planId,
          razorpaySubscriptionId: sub.id,
          status: this.toStatus(sub.status),
          totalCount: sub.total_count ?? schedule.totalCount,
        }),
      );

      return {
        subscriptionId: sub.id,
        frequency: dto.frequency,
        amount: d.amount,
        amountPaise: d.amountMinor,
        currency: 'INR',
        keyId: this.razorpay.getKeyId(),
        name: d.fullName,
        email: d.email,
        phone: d.phone,
      };
    } catch (err) {
      this.logger.error(
        `Razorpay subscription failed (${dto.frequency} INR ${d.amount}): ${this.donors.razorpayErrorReason(err)}`,
      );
      throw new BadRequestException(
        'Could not set up the recurring donation. Please try again.',
      );
    }
  }

  async verify(dto: VerifySubscriptionDto): Promise<SubscriptionVerifyResult> {
    const valid = this.razorpay.verifySubscriptionSignature(
      dto.razorpaySubscriptionId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
    if (!valid) {
      throw new BadRequestException(
        'Payment signature is invalid. Donation was not confirmed.',
      );
    }

    const subscription = await this.findByRazorpayId(dto.razorpaySubscriptionId);
    if (!subscription) {
      throw new NotFoundException('Recurring donation not found.');
    }

    await this.refreshFromRazorpay(subscription);

    let payment: PaymentEntity | null = null;
    try {
      payment = (await this.razorpay.fetchPayment(dto.razorpayPaymentId)) as PaymentEntity;
    } catch (err) {
      this.logger.warn(
        `Could not fetch payment ${dto.razorpayPaymentId}: ${this.donors.razorpayErrorReason(err)}`,
      );
    }

    // eMandate and some card flows only authorise the mandate here; the first
    // real charge then arrives through the subscription.charged webhook.
    const donor =
      payment?.status === 'captured' && Number(payment.amount) > 0
        ? await this.recordCharge(subscription, payment)
        : null;

    return { subscription, donor };
  }

  async handleWebhook(
    eventName: string,
    payload: any,
  ): Promise<{ received: boolean; event: string; message?: string }> {
    const entity = payload?.subscription?.entity as RazorpaySubscriptionInfo | undefined;
    if (!entity?.id) {
      return { received: true, event: eventName, message: 'No subscription in payload' };
    }

    const subscription = await this.findByRazorpayId(entity.id);
    if (!subscription) {
      this.logger.warn(`Webhook ${eventName} for unknown subscription ${entity.id}`);
      return { received: true, event: eventName, message: 'Unknown subscription' };
    }

    this.applyRazorpayState(subscription, entity);
    await this.repo.save(subscription);

    const payment = payload?.payment?.entity as PaymentEntity | undefined;
    if (eventName === 'subscription.charged' && payment?.id) {
      await this.recordCharge(subscription, payment);
    }

    this.logger.log(
      `Subscription ${subscription.id} → ${subscription.status} via ${eventName}`,
    );
    return { received: true, event: eventName };
  }

  async findAll(
    query: ListSubscriptionsQueryDto,
  ): Promise<PaginatedResult<DonationSubscription>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo.createQueryBuilder('sub').orderBy('sub.createdAt', 'DESC');
    // 'created' rows are checkouts the donor closed without approving; only listed when asked for.
    if (query.status) qb.andWhere('sub.status = :status', { status: query.status });
    else qb.andWhere("sub.status <> 'created'");
    if (query.frequency) {
      qb.andWhere('sub.frequency = :frequency', { frequency: query.frequency });
    }
    if (query.search) {
      qb.andWhere(
        '(sub.fullName ILIKE :search OR sub.email ILIKE :search OR sub.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<DonationSubscription> {
    const sub = await this.repo.findOne({ where: { id } });
    if (!sub) {
      throw new NotFoundException(`Recurring donation not found for id "${id}".`);
    }
    return sub;
  }

  async findCharges(id: string): Promise<Donor[]> {
    await this.findOne(id);
    return this.donorRepo.find({
      where: { subscriptionId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(id: string): Promise<DonationSubscription> {
    return this.changeState(id, 'cancel', (rzpId) =>
      this.razorpay.cancelSubscription(rzpId),
    );
  }

  async pause(id: string): Promise<DonationSubscription> {
    return this.changeState(id, 'pause', (rzpId) =>
      this.razorpay.pauseSubscription(rzpId),
    );
  }

  async resume(id: string): Promise<DonationSubscription> {
    return this.changeState(id, 'resume', (rzpId) =>
      this.razorpay.resumeSubscription(rzpId),
    );
  }

  async sync(id: string): Promise<DonationSubscription> {
    const sub = await this.findOne(id);
    return this.refreshFromRazorpay(sub);
  }

  private async changeState(
    id: string,
    action: 'cancel' | 'pause' | 'resume',
    call: (razorpayId: string) => Promise<RazorpaySubscriptionInfo>,
  ): Promise<DonationSubscription> {
    const sub = await this.findOne(id);
    if (ENDED_STATUSES.includes(sub.status)) {
      throw new BadRequestException(`This recurring donation has already ${sub.status === 'cancelled' ? 'been cancelled' : 'ended'}.`);
    }
    try {
      const updated = await call(sub.razorpaySubscriptionId);
      this.applyRazorpayState(sub, updated);
      return await this.repo.save(sub);
    } catch (err) {
      const reason = this.donors.razorpayErrorReason(err);
      this.logger.error(`Could not ${action} subscription ${sub.id}: ${reason}`);
      throw new BadRequestException(`Razorpay could not ${action} this donation: ${reason}`);
    }
  }

  /** Stores one charge as a paid donor row; safe to call twice for the same payment. */
  private async recordCharge(
    sub: DonationSubscription,
    payment: PaymentEntity,
  ): Promise<Donor> {
    const existing = await this.donorRepo.findOne({
      where: { razorpayPaymentId: payment.id },
    });
    if (existing) return existing;

    let donor: Donor;
    try {
      donor = await this.donorRepo.save(
        this.donorRepo.create({
          fullName: sub.fullName,
          phone: sub.phone ?? null,
          email: sub.email ?? null,
          city: sub.city ?? null,
          country: 'India',
          countryCode: 'IN',
          isInternational: false,
          pan: sub.pan ?? null,
          message: sub.message ?? null,
          donationCategory: sub.donationCategory,
          amount: (Number(payment.amount) / 100).toFixed(2),
          currency: payment.currency || sub.currency,
          status: DonationStatus.PAID,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id ?? null,
          patientStoryId: sub.patientStoryId ?? null,
          subscriptionId: sub.id,
        }),
      );
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).driverError?.code === '23505') {
        const raced = await this.donorRepo.findOne({
          where: { razorpayPaymentId: payment.id },
        });
        if (raced) return raced;
      }
      throw err;
    }

    donor.receiptNumber = this.donors.buildReceiptNumber(donor.id);
    Object.assign(donor, DonationEmailQueueService.queuedFields());
    const saved = await this.donorRepo.save(donor);
    this.emailQueue.kick();
    this.logger.log(
      `Recurring charge recorded. subscription=${sub.id} donor=${saved.id} receipt=${saved.receiptNumber}`,
    );
    return saved;
  }

  /** Razorpay plans have a fixed amount, so one plan is reused per frequency + amount. */
  private async findOrCreatePlan(
    frequency: DonationFrequency,
    amount: string,
    amountPaise: number,
  ): Promise<string> {
    const previous = await this.repo.findOne({
      where: { frequency, amount, currency: 'INR' },
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
    if (previous?.razorpayPlanId) return previous.razorpayPlanId;

    const schedule = FREQUENCY_PLANS[frequency];
    return this.razorpay.createPlan({
      period: schedule.period,
      interval: schedule.interval,
      amountPaise,
      currency: 'INR',
      name: `HCG Foundation ${schedule.label} Donation ₹${amount}`,
    });
  }

  private async refreshFromRazorpay(
    sub: DonationSubscription,
  ): Promise<DonationSubscription> {
    try {
      const live = await this.razorpay.fetchSubscription(sub.razorpaySubscriptionId);
      this.applyRazorpayState(sub, live);
      return await this.repo.save(sub);
    } catch (err) {
      this.logger.warn(
        `Could not refresh subscription ${sub.id}: ${this.donors.razorpayErrorReason(err)}`,
      );
      return sub;
    }
  }

  private applyRazorpayState(
    sub: DonationSubscription,
    live: RazorpaySubscriptionInfo,
  ) {
    sub.status = this.toStatus(live.status);
    if (typeof live.paid_count === 'number') sub.paidCount = live.paid_count;
    if (typeof live.total_count === 'number') sub.totalCount = live.total_count;
    const next = live.charge_at ?? live.current_end;
    sub.nextChargeAt =
      next && !ENDED_STATUSES.includes(sub.status) ? new Date(next * 1000) : null;
    if (ENDED_STATUSES.includes(sub.status)) {
      sub.endedAt = live.ended_at ? new Date(live.ended_at * 1000) : sub.endedAt ?? new Date();
    }
  }

  private toStatus(value: string): SubscriptionStatus {
    return (SUBSCRIPTION_STATUSES as readonly string[]).includes(value)
      ? (value as SubscriptionStatus)
      : 'created';
  }

  private findByRazorpayId(razorpaySubscriptionId: string) {
    return this.repo.findOne({ where: { razorpaySubscriptionId } });
  }
}
