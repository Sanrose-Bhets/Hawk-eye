import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
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
import { CalendarService } from './calendar.service.js';
import { CreateCalendarNoteDto } from './dto/create-calendar-note.dto.js';
import { UpdateCalendarNoteDto } from './dto/update-calendar-note.dto.js';
import {
  CalendarNoteResponseDto,
  PaginatedCalendarNoteResponseDto,
} from './dto/calendar-response.dto.js';

@ApiTags('Calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RTE')
@Controller('calendar-notes')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a calendar note (RTE only)' })
  @ApiResponse({
    status: 201,
    description: 'Note created',
    type: CalendarNoteResponseDto,
  })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateCalendarNoteDto,
  ): Promise<CalendarNoteResponseDto> {
    return this.calendarService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List calendar notes (RTE only)' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of calendar notes',
    type: [CalendarNoteResponseDto],
  })
  findAll(
    @Request() req: { user: { id: string } },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<CalendarNoteResponseDto[]> {
    return this.calendarService.findAll(req.user.id, {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a calendar note by ID (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'Note details',
    type: CalendarNoteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<CalendarNoteResponseDto> {
    return this.calendarService.findById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a calendar note (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'Note updated',
    type: CalendarNoteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCalendarNoteDto,
  ): Promise<CalendarNoteResponseDto> {
    return this.calendarService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a calendar note (RTE only)' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<void> {
    return this.calendarService.delete(id, req.user.id);
  }
}
