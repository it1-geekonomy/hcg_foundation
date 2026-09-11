import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnualReportsController } from './annual-reports.controller';
import { AnnualReportsService } from './annual-reports.service';
import { AnnualReport } from './entities/annual-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnnualReport])],
  controllers: [AnnualReportsController],
  providers: [AnnualReportsService],
  exports: [AnnualReportsService, TypeOrmModule],
})
export class AnnualReportsModule {}
