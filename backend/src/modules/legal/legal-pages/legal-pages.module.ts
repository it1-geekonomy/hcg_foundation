import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalPage } from './entities/legal-page.entity';
import { LegalPagesController } from './legal-pages.controller';
import { LegalPagesService } from './legal-pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([LegalPage])],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
  exports: [LegalPagesService, TypeOrmModule],
})
export class LegalPagesModule {}
