import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../../../common/storage/storage.module';
import { AnnualReportsController } from './annual-reports.controller';
import { AnnualReportsService } from './annual-reports.service';
import { AnnualReport } from './entities/annual-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnnualReport]), StorageModule],
  controllers: [AnnualReportsController],
  providers: [AnnualReportsService],
  exports: [AnnualReportsService, TypeOrmModule],
})
export class AnnualReportsModule {}
