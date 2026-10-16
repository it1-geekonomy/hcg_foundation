import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { Donor } from './entities/donor.entity';
import { DonorsService } from './donors.service';

@ApiTags(ApiTagsConst.DONATION)
@Controller('donors')
export class DonorsController {
  constructor(private readonly service: DonorsService) {}

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
      'Receives webhook events from Razorpay (refund.processed, payment.refunded, payment.failed). Verifies x-razorpay-signature.',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? JSON.stringify(req.body);
    const data = await this.service.handleRazorpayWebhook(rawBody, signature);
    return {
      statusCode: HttpStatus.OK,
      message: 'Webhook processed successfully',
      data,
    };
  }
}
