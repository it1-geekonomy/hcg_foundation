import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CdnService } from '../../common/storage/cdn.service';
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import { UpdateTrusteeDto } from './dto/update-trustee.dto';
import { Trustee } from './entities/trustee.entity';
import { TrusteesController } from './trustees.controller';
import { TrusteesService } from './trustees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trustee])],
  controllers: [TrusteesController],
  providers: [TrusteesService, CdnService],
  exports: [TrusteesService],
})
export class TrusteesModule {}
