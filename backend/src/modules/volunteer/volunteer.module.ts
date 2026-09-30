import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { VolunteerController } from './volunteer.controller';
import { VolunteerService } from './volunteer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteer])],
  controllers: [VolunteerController],
  providers: [VolunteerService],
  exports: [VolunteerService],
})
export class VolunteerModule {}
