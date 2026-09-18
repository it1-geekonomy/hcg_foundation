import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazorpayService } from '../../common/payments/razorpay.service';
import { DonorsController } from './donors.controller';
import { DonorsService } from './donors.service';
import { Donor } from './entities/donor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donor])],
  controllers: [DonorsController],
  providers: [DonorsService, RazorpayService],
  exports: [DonorsService, TypeOrmModule],
})
export class DonorsModule {}
