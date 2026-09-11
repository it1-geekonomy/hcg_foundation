import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicy } from './entities/privacy-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrivacyPolicy])],
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService],
  exports: [PrivacyPolicyService, TypeOrmModule],
})
export class PrivacyPolicyModule {}
