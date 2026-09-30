import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsInternshipController } from './leads-internship.controller';
import { LeadsInternshipService } from './leads-internship.service';
import { LeadsInternship } from './entities/leads-internship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadsInternship])],
  controllers: [LeadsInternshipController],
  providers: [LeadsInternshipService],
  exports: [LeadsInternshipService, TypeOrmModule],
})
export class LeadsInternshipModule {}
