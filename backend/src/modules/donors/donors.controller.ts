import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiTagsConst } from '../../common/constants/api-tags';
import { Public } from '../../common/decorators/public.decorator';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ListDonorsQueryDto } from './dto/list-donors-query.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { UpdateDonorCounterSettingsDto } from './dto/update-donor-counter-settings.dto';
import { Donor } from './entities/donor.entity';
import { DonorCounterSettings } from './entities/donor-counter-settings.entity';
import { DonorsService } from './donors.service';
import { DonationSubscriptionsService } from './donation-subscriptions.service';

@ApiTags(ApiTagsConst.DONATION)
@Controller('donors')
export class DonorsController {
  constructor(
    private readonly service: DonorsService,
    private readonly subscriptions: DonationSubscriptionsService,
  ) {}

  @Public()
  @Post('orders')
  @ApiOperation({
    summary: 'Start donation (website Donate Now)',
    description:
      'Creates a Razorpay order only. Donor details are stored on the order until payment succeeds. Frontend opens Checkout with `keyId` + `orderId`, then calls POST /donors/verify.',
  })
  @ApiCreatedResponse({ description: 'Razorpay checkout payload' })
  async createOrder(@Body() dto: CreateDonationDto) {
    const data = await this.service.createOrder(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Donation order created successfully',
      data,
    };
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Razorpay payment (website)',
    description:
      'Call from the Razorpay Checkout success handler. Confirms the signature and inserts the donor row as paid.',
  })
  @ApiOkResponse({ type: Donor })
  async verify(@Body() dto: VerifyDonationDto) {
    const data = await this.service.verifyPayment(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payment verified successfully',
      data,
    };
  }

  @Public()
  @Get('monthly-count')
  @ApiOperation({
    summary: 'Get current month donors count (website / Donate Now)',
    description:
      'Returns the number of paid donors who contributed in the current month.',
  })
  @ApiOkResponse({
    description: 'Current month donor count',
  })
  async getMonthlyCount() {
    const data = await this.service.getCurrentMonthCount();
    return {
      statusCode: HttpStatus.OK,
      message: 'Monthly donor count fetched successfully',
      data,
    };
  }

  @Get('counter-settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get donor display counter settings (CMS)',
    description:
      'Returns the current configured donor count to be displayed on the website.',
  })
  @ApiOkResponse({ type: DonorCounterSettings })
  async getCounterSettings() {
    const data = await this.service.getCounterSettings();
    return {
      statusCode: HttpStatus.OK,
      message: 'Donor counter settings fetched successfully',
      data,
    };
  }

  @Patch('counter-settings')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update donor display count (CMS)',
    description:
      'Allows admin in CMS to set the donor count number to display on the website.',
  })
  @ApiOkResponse({ type: DonorCounterSettings })
  async updateCounterSettings(@Body() dto: UpdateDonorCounterSettingsDto) {
    const data = await this.service.updateCounterSettings(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donor counter settings updated successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List donors (CMS)',
    description:
      'Successful payments only by default. Pass status=pending for old abandoned rows.',
  })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: ListDonorsQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No donors found'
          : 'Donors fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donor by id (CMS)' })
  @ApiOkResponse({ type: Donor })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Donor fetched successfully',
      data,
    };
  }

  @Post('sync-all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync all donors status with Razorpay (CMS)',
    description:
      'Loops through all donors and fetches their live status from Razorpay.',
  })
  async syncAll() {
    const data = await this.service.syncAll();
    return {
      statusCode: HttpStatus.OK,
      message: `Synced ${data.synced} donors with Razorpay (${data.updated} updated)`,
      data,
    };
  }

  @Post(':id/sync')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync donor status with Razorpay (CMS)',
    description:
      'Fetches current payment/order status from Razorpay and updates the donor if refunded, captured, or failed.',
  })
  @ApiOkResponse({ type: Donor })
  async syncStatus(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.syncPaymentStatus(id);
    return {
      statusCode: HttpStatus.OK,
      message: `Status synced with Razorpay: ${data.status}`,
      data,
    };
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Razorpay webhook receiver',
    description:
      'Receives webhook events from Razorpay (payment.*, refund.*, order.paid, and subscription.* for recurring donations). Verifies x-razorpay-signature.',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? JSON.stringify(req.body);
    const { event, payload } = this.service.parseRazorpayWebhook(rawBody, signature);
    const data = event.startsWith('subscription.')
      ? await this.subscriptions.handleWebhook(event, payload)
      : await this.service.handlePaymentWebhook(event, payload);
    return {
      statusCode: HttpStatus.OK,
      message: 'Webhook processed successfully',
      data,
    };
  }
}
