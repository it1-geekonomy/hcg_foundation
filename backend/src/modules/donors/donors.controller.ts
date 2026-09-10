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
      'Creates a pending donor row and a Razorpay order. Frontend opens Razorpay Checkout with `keyId` + `orderId`, then calls POST /donors/verify.',
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
      'Call from the Razorpay Checkout success handler. Confirms the signature and marks the donation paid.',
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

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List donors (CMS)',
    description: 'All donation statuses. Optional status/search filters.',
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
}
