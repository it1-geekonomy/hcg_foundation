import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsContactController } from './leads-contact.controller';
import { LeadsContactService } from './leads-contact.service';
import { LeadsContact } from './entities/leads-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadsContact])],
  controllers: [LeadsContactController],
  providers: [LeadsContactService],
  exports: [LeadsContactService, TypeOrmModule],
})
export class LeadsContactModule {}
