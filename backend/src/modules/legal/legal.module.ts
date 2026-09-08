import { Module } from '@nestjs/common';
import { LegalPagesModule } from './legal-pages/legal-pages.module';

@Module({
  imports: [LegalPagesModule],
  exports: [LegalPagesModule],
})
export class LegalModule {}
