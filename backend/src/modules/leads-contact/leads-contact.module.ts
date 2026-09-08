import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsContactController } from './leads-contact.controller';
import { LeadsContactService } from './leads-contact.service';
import { LeadContact } from './entities/lead-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadContact])],
  controllers: [LeadsContactController],
  providers: [LeadsContactService],
  exports: [LeadsContactService, TypeOrmModule],
})
export class LeadsContactModule {}
