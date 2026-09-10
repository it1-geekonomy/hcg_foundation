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
  donorId: string;
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

    const donor = await this.repo.save(
      this.repo.create({
        fullName: dto.fullName.trim(),
        phone: dto.phone,
        email: dto.email.toLowerCase().trim(),
        city: dto.city?.trim() || null,
        pan: dto.pan?.trim() || null,
        message: dto.message?.trim() || null,
        amount,
        currency: 'INR',
        status: DonationStatus.PENDING,
      }),
    );

    try {
      const order = await this.razorpay.createOrder({
        amountPaise,
        currency: 'INR',
        receipt: `hcg_${donor.id.replace(/-/g, '').slice(0, 20)}`,
        notes: {
          donorId: donor.id,
          fullName: donor.fullName,
        },
      });
      donor.razorpayOrderId = order.id;
      await this.repo.save(donor);
    } catch (err) {
      donor.status = DonationStatus.FAILED;
      await this.repo.save(donor);
      this.logger.error(
        `Razorpay order failed for donor ${donor.id}: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
      throw new BadRequestException(
        'Could not start payment. Please try again.',
      );
    }

    return {
      donorId: donor.id,
      orderId: donor.razorpayOrderId as string,
      amount: donor.amount,
      amountPaise,
      currency: donor.currency,
      keyId: this.razorpay.getKeyId(),
      name: donor.fullName,
      email: donor.email as string,
      phone: donor.phone as string,
    };
  }

  async verifyPayment(dto: VerifyDonationDto): Promise<Donor> {
    const donor = await this.repo.findOne({
      where: { razorpayOrderId: dto.razorpayOrderId },
    });
    if (!donor) {
      throw new NotFoundException(
        `Donation not found for Razorpay order "${dto.razorpayOrderId}".`,
      );
    }

    if (donor.status === DonationStatus.PAID) {
      return donor;
    }

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

    donor.status = DonationStatus.PAID;
    donor.razorpayPaymentId = dto.razorpayPaymentId;
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

    if (query.status) {
      qb.andWhere('donor.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(donor.fullName ILIKE :search OR donor.email ILIKE :search OR donor.phone ILIKE :search OR donor.receiptNumber ILIKE :search)',
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

  private buildReceiptNumber(id: string): string {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `HCG-${stamp}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }
}
