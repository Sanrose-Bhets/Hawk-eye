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
import { TeacherService } from './teacher.service.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import {
  TeacherResponseDto,
  PaginatedTeacherResponseDto,
} from './dto/teacher-response.dto.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a teacher (Student Service only)' })
  @ApiResponse({
    status: 201,
    description: 'Teacher created',
    type: TeacherResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Teacher email already exists' })
  create(@Body() dto: CreateTeacherDto): Promise<TeacherResponseDto> {
    return this.teacherService.create(dto);
  }

  @Get()
  @Roles('STUDENT_SERVICE', 'RTE', 'STUDENT')
  @ApiOperation({ summary: 'List all teachers with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of teachers',
    type: PaginatedTeacherResponseDto,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<PaginatedTeacherResponseDto> {
    return this.teacherService.findAll({ page, limit, search });
  }

  @Get(':id')
  @Roles('STUDENT_SERVICE', 'RTE', 'STUDENT')
  @ApiOperation({ summary: 'Get a teacher by ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher details',
    type: TeacherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  findOne(@Param('id') id: string): Promise<TeacherResponseDto> {
    return this.teacherService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a teacher (Student Service only)' })
  @ApiResponse({
    status: 200,
    description: 'Teacher updated',
    type: TeacherResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    return this.teacherService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a teacher (Student Service only)' })
  @ApiResponse({ status: 204, description: 'Teacher deleted' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  delete(@Param('id') id: string): Promise<void> {
    return this.teacherService.delete(id);
  }
}
