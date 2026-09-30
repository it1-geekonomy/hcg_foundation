import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientTestimonialsController } from './patient-testimonials.controller';
import { PatientTestimonialsService } from './patient-testimonials.service';
import { PatientTestimonial } from './entities/patient-testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientTestimonial])],
  controllers: [PatientTestimonialsController],
  providers: [PatientTestimonialsService],
  exports: [PatientTestimonialsService, TypeOrmModule],
})
export class PatientTestimonialsModule {}
