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
import { FacultyService } from './faculty.service.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';
import { UpdateFacultyDto } from './dto/update-faculty.dto.js';
import {
  FacultyResponseDto,
  PaginatedFacultyResponseDto,
} from './dto/faculty-response.dto.js';

@ApiTags('Faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a faculty' })
  @ApiResponse({
    status: 201,
    description: 'Faculty created',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Faculty name already exists' })
  createFaculty(@Body() dto: CreateFacultyDto): Promise<FacultyResponseDto> {
    return this.facultyService.createFaculty(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all faculties with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of faculties',
    type: PaginatedFacultyResponseDto,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<PaginatedFacultyResponseDto> {
    return this.facultyService.findAllFaculties({ page, limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a faculty by ID' })
  @ApiResponse({
    status: 200,
    description: 'Faculty details',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  findFaculty(@Param('id') id: string): Promise<FacultyResponseDto> {
    return this.facultyService.findFacultyById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a faculty' })
  @ApiResponse({
    status: 200,
    description: 'Faculty updated',
    type: FacultyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  @ApiResponse({ status: 409, description: 'Faculty name already exists' })
  updateFaculty(
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
  ): Promise<FacultyResponseDto> {
    return this.facultyService.updateFaculty(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a faculty' })
  @ApiResponse({ status: 204, description: 'Faculty deleted' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  deleteFaculty(@Param('id') id: string): Promise<void> {
    return this.facultyService.deleteFaculty(id);
  }
}
