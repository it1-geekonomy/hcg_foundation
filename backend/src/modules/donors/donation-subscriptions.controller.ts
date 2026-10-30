import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiTagsConst } from '../../common/constants/api-tags';
import { Public } from '../../common/decorators/public.decorator';
import { DonationSubscriptionsService } from './donation-subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsQueryDto } from './dto/list-subscriptions-query.dto';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { DonationSubscription } from './entities/donation-subscription.entity';

@ApiTags(ApiTagsConst.DONATION)
@Controller('donation-subscriptions')
export class DonationSubscriptionsController {
  constructor(private readonly service: DonationSubscriptionsService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Start a recurring donation (website)',
    description:
      'Monthly, quarterly or yearly, INR only. Creates a Razorpay subscription; the frontend opens Checkout with `keyId` + `subscriptionId`, then calls POST /donation-subscriptions/verify.',
  })
  @ApiCreatedResponse({ description: 'Razorpay checkout payload' })
  async create(@Body() dto: CreateSubscriptionDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Recurring donation created successfully',
      data,
    };
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify recurring donation checkout (website)',
    description:
      'Call from the Razorpay Checkout success handler. Confirms the signature and, if the first charge was taken, records it as a paid donation.',
  })
  async verify(@Body() dto: VerifySubscriptionDto) {
    const data = await this.service.verify(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Recurring donation confirmed',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List recurring donations (CMS)' })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  async findAll(@Query() query: ListSubscriptionsQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No recurring donations found'
          : 'Recurring donations fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recurring donation with its charges (CMS)' })
  @ApiOkResponse({ type: DonationSubscription })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const [subscription, charges] = await Promise.all([
      this.service.findOne(id),
      this.service.findCharges(id),
    ]);
    return {
      statusCode: HttpStatus.OK,
      message: 'Recurring donation fetched successfully',
      data: { ...subscription, charges },
    };
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel recurring donation now (CMS)' })
  @ApiOkResponse({ type: DonationSubscription })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.cancel(id);
    return { statusCode: HttpStatus.OK, message: 'Recurring donation cancelled', data };
  }

  @Post(':id/pause')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause recurring donation (CMS)' })
  @ApiOkResponse({ type: DonationSubscription })
  async pause(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.pause(id);
    return { statusCode: HttpStatus.OK, message: 'Recurring donation paused', data };
  }

  @Post(':id/resume')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused recurring donation (CMS)' })
  @ApiOkResponse({ type: DonationSubscription })
  async resume(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.resume(id);
    return { statusCode: HttpStatus.OK, message: 'Recurring donation resumed', data };
  }

  @Post(':id/sync')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh status from Razorpay (CMS)' })
  @ApiOkResponse({ type: DonationSubscription })
  async sync(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.sync(id);
    return { statusCode: HttpStatus.OK, message: `Status synced: ${data.status}`, data };
  }
}
