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
import { CreateDonationDto } from './dto/create-donation.dto';
import { ListDonorsQueryDto } from './dto/list-donors-query.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { Donor } from './entities/donor.entity';

export type DonationCheckout = {
  orderId: string;
  amount: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  name: string;
  email: string;
  phone: string;
};

@Injectable()
export class DonorsService {
  private readonly logger = new Logger(DonorsService.name);

  constructor(
    @InjectRepository(Donor)
    private readonly repo: Repository<Donor>,
    private readonly razorpay: RazorpayService,
  ) {}

  async createOrder(dto: CreateDonationDto): Promise<DonationCheckout> {
    const amount = dto.amount.toFixed(2);
    const amountPaise = Math.round(dto.amount * 100);
    const fullName = dto.fullName.trim();
    const phone = dto.phone;
    const email = dto.email.toLowerCase().trim();
    const city = dto.city?.trim() || '';
    const pan = dto.pan?.trim() || '';
    const message = dto.message?.trim() || '';

    try {
      const order = await this.razorpay.createOrder({
        amountPaise,
        currency: 'INR',
        receipt: `hcg_${Date.now().toString(36)}`.slice(0, 40),
        notes: {
          fullName: this.note(fullName),
          phone: this.note(phone, 20),
          email: this.note(email),
          city: this.note(city),
          pan: this.note(pan, 20),
          message: this.note(message),
          amount,
        },
      });

      return {
        orderId: order.id,
        amount,
        amountPaise,
        currency: 'INR',
        keyId: this.razorpay.getKeyId(),
        name: fullName,
        email,
        phone,
      };
    } catch (err) {
      this.logger.error(
        `Razorpay order failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
      throw new BadRequestException(
        'Could not start payment. Please try again.',
      );
    }
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
      const saved = await this.repo.save(existing);
      this.logger.log(
        `Donation paid. donor=${saved.id} receipt=${saved.receiptNumber}`,
      );
      return saved;
    }

    const order = await this.razorpay.fetchOrder(dto.razorpayOrderId);
    const notes = order.notes ?? {};
    const amount =
      notes.amount || (Number(order.amount) / 100).toFixed(2);

    const donor = await this.repo.save(
      this.repo.create({
        fullName: notes.fullName?.trim() || 'Donor',
        phone: notes.phone || null,
        email: notes.email?.toLowerCase().trim() || null,
        city: notes.city?.trim() || null,
        pan: notes.pan?.trim() || null,
        message: notes.message?.trim() || null,
        amount,
        currency: order.currency || 'INR',
        status: DonationStatus.PAID,
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
      }),
    );
    donor.receiptNumber = this.buildReceiptNumber(donor.id);
    const saved = await this.repo.save(donor);
    this.logger.log(
      `Donation paid. donor=${saved.id} receipt=${saved.receiptNumber}`,
    );
    return saved;
  }

  async findAll(query: ListDonorsQueryDto): Promise<PaginatedResult<Donor>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repo
      .createQueryBuilder('donor')
      .orderBy('donor.createdAt', 'DESC');

    qb.andWhere('donor.status = :status', {
      status: query.status ?? DonationStatus.PAID,
    });

    if (query.search) {
      qb.andWhere(
        '(donor.fullName ILIKE :search OR donor.email ILIKE :search OR donor.phone ILIKE :search OR donor.receiptNumber ILIKE :search OR donor.city ILIKE :search)',
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

  private note(value: string, max = 256): string {
    return value.slice(0, max);
  }

  private buildReceiptNumber(id: string): string {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `HCG-${stamp}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }
}
