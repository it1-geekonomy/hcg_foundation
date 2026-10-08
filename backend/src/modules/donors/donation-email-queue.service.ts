import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ReceiptEmailStatus } from '../../common/enums/receipt-email-status.enum';
import { EmailService, QuotaScope } from '../email/email.service';
import { Donor } from './entities/donor.entity';

const FIRST_RUN_DELAY_MS = 30_000;
const RUN_EVERY_MS = 5 * 60_000;
const BATCH_SIZE = 20;
/** Resend allows a few requests per second; stay well under it. */
const SEND_GAP_MS = 600;
/** A crash mid-send leaves a row in "sending"; after this long it is retried. */
const STALE_SENDING_MS = 15 * 60_000;
const RETRY_DELAYS_MIN = [5, 30, 120, 360, 720];
const MAX_ATTEMPTS = RETRY_DELAYS_MIN.length + 1;

function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Resend's daily quota resets at 00:00 UTC (05:30 IST); the monthly one on the 1st. */
function quotaResetsAt(scope: QuotaScope, now = new Date()): Date {
  if (scope === 'rate') return new Date(now.getTime() + 60_000);
  if (scope === 'monthly') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 1));
  }
  return new Date(startOfUtcDay(now).getTime() + 24 * 60 * 60_000 + 60_000);
}

function istLabel(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends donation receipt emails from a queue kept on the donors table, so the
 * Resend daily quota is never exceeded: once the day's limit is used, receipts
 * wait and go out after the quota resets. Temporary failures are retried with
 * backoff; nothing is lost on restart.
 */
@Injectable()
export class DonationEmailQueueService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(DonationEmailQueueService.name);
  private readonly timers: NodeJS.Timeout[] = [];
  private running = false;
  private rerun = false;
  private pausedUntil = 0;

  constructor(
    @InjectRepository(Donor)
    private readonly repo: Repository<Donor>,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap() {
    const first = setTimeout(() => void this.run(), FIRST_RUN_DELAY_MS);
    const every = setInterval(() => void this.run(), RUN_EVERY_MS);
    first.unref();
    every.unref();
    this.timers.push(first, every);
  }

  onApplicationShutdown() {
    this.timers.forEach((timer) => clearTimeout(timer));
  }

  /** Fields to set on a donation that has just been paid. */
  static queuedFields(): Pick<
    Donor,
    'receiptEmailStatus' | 'receiptEmailAttempts' | 'receiptEmailNextAttemptAt' | 'receiptEmailError'
  > {
    return {
      receiptEmailStatus: ReceiptEmailStatus.QUEUED,
      receiptEmailAttempts: 0,
      receiptEmailNextAttemptAt: new Date(),
      receiptEmailError: null,
    };
  }

  /** Sends right away when today's quota allows; otherwise the receipt waits in the queue. */
  kick(): void {
    void this.run();
  }

  async run(): Promise<void> {
    if (this.running) {
      this.rerun = true;
      return;
    }
    this.running = true;
    try {
      do {
        this.rerun = false;
        await this.drain();
      } while (this.rerun);
    } catch (err) {
      this.logger.error(`Receipt email queue run failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private get dailyLimit(): number {
    const limit = this.config.get<number>('email.dailyLimit') ?? 100;
    return Number.isFinite(limit) && limit > 0 ? limit : Infinity;
  }

  private async drain(): Promise<void> {
    if (!this.email.isEnabled() || Date.now() < this.pausedUntil) return;
    await this.releaseStale();

    for (;;) {
      if (Date.now() < this.pausedUntil) return;
      const due = await this.repo.find({
        where: {
          receiptEmailStatus: ReceiptEmailStatus.QUEUED,
          receiptEmailNextAttemptAt: LessThanOrEqual(new Date()),
        },
        order: { receiptEmailNextAttemptAt: 'ASC', createdAt: 'ASC' },
        take: BATCH_SIZE,
      });
      if (!due.length) return;

      const remaining = this.dailyLimit - (await this.sentToday());
      if (remaining <= 0) {
        await this.pause('daily', `daily limit of ${this.dailyLimit} receipt emails reached`);
        return;
      }
      due.splice(remaining);

      for (const [i, donor] of due.entries()) {
        if (i > 0) await sleep(SEND_GAP_MS);
        if (!(await this.deliver(donor))) return;
      }
    }
  }

  /** Returns false when the queue must stop (quota reached). */
  private async deliver(donor: Donor): Promise<boolean> {
    const claimed = await this.repo.update(
      { id: donor.id, receiptEmailStatus: ReceiptEmailStatus.QUEUED },
      { receiptEmailStatus: ReceiptEmailStatus.SENDING },
    );
    if (!claimed.affected) return true;

    const result = await this.email.sendDonationReceipt(donor);
    const attempts = (donor.receiptEmailAttempts ?? 0) + 1;

    switch (result.status) {
      case 'sent':
        await this.repo.update(donor.id, {
          receiptEmailStatus: ReceiptEmailStatus.SENT,
          receiptEmailAttempts: attempts,
          receiptEmailSentAt: new Date(),
          receiptEmailNextAttemptAt: null,
          receiptEmailError: null,
        });
        return true;

      case 'skipped':
        await this.repo.update(donor.id, {
          receiptEmailStatus: ReceiptEmailStatus.SKIPPED,
          receiptEmailNextAttemptAt: null,
          receiptEmailError: result.reason,
        });
        return true;

      case 'quota': {
        const resetsAt = quotaResetsAt(result.scope);
        await this.repo.update(donor.id, {
          receiptEmailStatus: ReceiptEmailStatus.QUEUED,
          receiptEmailNextAttemptAt: resetsAt,
          receiptEmailError: `Waiting for Resend ${result.scope} quota`,
        });
        await this.pause(result.scope, `Resend ${result.scope} quota reached`);
        return false;
      }

      case 'error': {
        const giveUp = attempts >= MAX_ATTEMPTS;
        const delayMin = RETRY_DELAYS_MIN[Math.min(attempts - 1, RETRY_DELAYS_MIN.length - 1)];
        await this.repo.update(donor.id, {
          receiptEmailStatus: giveUp ? ReceiptEmailStatus.FAILED : ReceiptEmailStatus.QUEUED,
          receiptEmailAttempts: attempts,
          receiptEmailNextAttemptAt: giveUp ? null : new Date(Date.now() + delayMin * 60_000),
          receiptEmailError: result.message.slice(0, 1000),
        });
        if (giveUp) {
          this.logger.error(
            `Receipt email for donor ${donor.id} failed ${attempts} times; giving up: ${result.message}`,
          );
        } else {
          this.logger.warn(
            `Receipt email for donor ${donor.id} failed (attempt ${attempts}); retrying in ${delayMin} min`,
          );
        }
        return true;
      }
    }
  }

  private async pause(scope: QuotaScope, reason: string): Promise<void> {
    const resetsAt = quotaResetsAt(scope);
    this.pausedUntil = resetsAt.getTime();
    if (scope === 'rate') return;
    const waiting = await this.repo.count({
      where: { receiptEmailStatus: ReceiptEmailStatus.QUEUED },
    });
    this.logger.warn(
      `Receipt emails paused: ${reason}. ${waiting} queued, sending resumes after ${istLabel(resetsAt)} IST.`,
    );
  }

  private sentToday(): Promise<number> {
    return this.repo.count({
      where: { receiptEmailSentAt: MoreThanOrEqual(startOfUtcDay()) },
      withDeleted: true,
    });
  }

  private async releaseStale(): Promise<void> {
    const released = await this.repo.update(
      {
        receiptEmailStatus: ReceiptEmailStatus.SENDING,
        updatedAt: LessThan(new Date(Date.now() - STALE_SENDING_MS)),
      },
      { receiptEmailStatus: ReceiptEmailStatus.QUEUED },
    );
    if (released.affected) {
      this.logger.warn(`Re-queued ${released.affected} receipt email(s) left in "sending"`);
    }
  }
}
