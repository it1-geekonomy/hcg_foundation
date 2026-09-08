import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewslettersController } from './newsletters.controller';
import { NewslettersService } from './newsletters.service';
import { Newsletter } from './entities/newsletter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter])],
  controllers: [NewslettersController],
  providers: [NewslettersService],
  exports: [NewslettersService, TypeOrmModule],
})
export class NewslettersModule {}
