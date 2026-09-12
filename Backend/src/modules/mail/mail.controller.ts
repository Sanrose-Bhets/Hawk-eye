import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { MailService } from './mail.service.js';
import { SendMailDto, SendBulkMailDto } from './dto/send-mail.dto.js';
import {
  EmailLogResponseDto,
  PaginatedEmailLogResponseDto,
  MailStatsResponseDto,
  SendMailResponseDto,
} from './dto/mail-response.dto.js';

@ApiTags('Mail')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email to a student parent' })
  @ApiResponse({
    status: 200,
    description: 'Email queued',
    type: SendMailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  send(@Body() dto: SendMailDto): Promise<SendMailResponseDto> {
    return this.mailService.sendToParent(dto.studentId, dto.subject, dto.body);
  }

  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email to multiple student parents' })
  @ApiResponse({ status: 200, description: 'Bulk send results' })
  sendBulk(@Body() dto: SendBulkMailDto): Promise<{
    queued: number;
    errors: { studentId: string; reason: string }[];
  }> {
    return this.mailService.sendBulk(dto.studentIds, dto.subject, dto.body);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get email logs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated email logs',
    type: PaginatedEmailLogResponseDto,
  })
  getLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ): Promise<PaginatedEmailLogResponseDto> {
    return this.mailService.findAll({ page, limit, status });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get mail stats' })
  @ApiResponse({
    status: 200,
    description: 'Mail statistics',
    type: MailStatsResponseDto,
  })
  getStats(): Promise<MailStatsResponseDto> {
    return this.mailService.getStats();
  }
}
