import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnershipInquiry } from './entities/partnership-inquiry.entity';
import { PartnershipInquiriesController } from './partnership-inquiries.controller';
import { PartnershipInquiriesService } from './partnership-inquiries.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartnershipInquiry])],
  controllers: [PartnershipInquiriesController],
  providers: [PartnershipInquiriesService],
  exports: [PartnershipInquiriesService],
})
export class PartnershipInquiriesModule {}
