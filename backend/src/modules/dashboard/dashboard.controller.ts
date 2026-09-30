import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregate dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned successfully' })
  async getStats() {
    const data = await this.dashboardService.getStats();
    return {
      statusCode: 200,
      message: 'Dashboard statistics fetched successfully',
      data,
    };
  }
}
