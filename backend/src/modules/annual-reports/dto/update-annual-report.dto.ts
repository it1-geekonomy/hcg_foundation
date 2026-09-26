import { PartialType } from '@nestjs/swagger';
import { CreateAnnualReportDto } from './create-annual-report.dto';

export class UpdateAnnualReportDto extends PartialType(CreateAnnualReportDto) {}
