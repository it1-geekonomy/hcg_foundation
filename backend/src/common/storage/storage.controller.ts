import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { R2StorageService } from './r2-storage.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('storage')
@Controller('storage')
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly r2StorageService: R2StorageService) {}

  @Get('metrics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total storage consumed and object count from R2' })
  @ApiResponse({ status: 200, description: 'Storage metrics fetched successfully' })
  async getMetrics() {
    const data = await this.r2StorageService.getStorageMetrics();
    return {
      statusCode: 200,
      message: 'Storage metrics fetched successfully',
      data,
    };
  }
}
