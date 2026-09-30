import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';
import { TermsAndCondition } from './entities/terms-and-condition.entity';
import { TermsAndConditionsController } from './terms-and-conditions.controller';
import { TermsAndConditionsService } from './terms-and-conditions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TermsAndCondition])],
  controllers: [TermsAndConditionsController],
  providers: [TermsAndConditionsService],
  exports: [TermsAndConditionsService],
})
export class TermsAndConditionsModule {}
