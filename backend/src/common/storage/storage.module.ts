import { Global, Module } from '@nestjs/common';
import { CdnService } from './cdn.service';
import { R2StorageService } from './r2-storage.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [R2StorageService, CdnService],
  exports: [R2StorageService, CdnService],
})
export class StorageModule {}
