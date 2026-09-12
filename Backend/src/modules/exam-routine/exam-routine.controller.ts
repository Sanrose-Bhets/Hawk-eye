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
import { ExamRoutineService } from './exam-routine.service.js';
import { CreateExamRoutineDto } from './dto/create-exam-routine.dto.js';
import { UpdateExamRoutineDto } from './dto/update-exam-routine.dto.js';
import { ExamRoutineResponseDto } from './dto/exam-routine-response.dto.js';

@ApiTags('Exam Routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RTE')
@Controller('exam-routines')
export class ExamRoutineController {
  constructor(private readonly examRoutineService: ExamRoutineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an exam routine (RTE only)' })
  @ApiResponse({
    status: 201,
    description: 'Exam routine created',
    type: ExamRoutineResponseDto,
  })
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateExamRoutineDto,
  ): Promise<ExamRoutineResponseDto> {
    return this.examRoutineService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List exam routines (RTE only)' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of exam routines',
    type: [ExamRoutineResponseDto],
  })
  findAll(
    @Request() req: { user: { id: string } },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ): Promise<ExamRoutineResponseDto[]> {
    return this.examRoutineService.findAll(req.user.id, {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exam routine by ID (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'Exam routine details',
    type: ExamRoutineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exam routine not found' })
  findOne(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<ExamRoutineResponseDto> {
    return this.examRoutineService.findById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exam routine (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'Exam routine updated',
    type: ExamRoutineResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exam routine not found' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateExamRoutineDto,
  ): Promise<ExamRoutineResponseDto> {
    return this.examRoutineService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an exam routine (RTE only)' })
  @ApiResponse({ status: 204, description: 'Exam routine deleted' })
  @ApiResponse({ status: 404, description: 'Exam routine not found' })
  remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<void> {
    return this.examRoutineService.delete(id, req.user.id);
  }
}
