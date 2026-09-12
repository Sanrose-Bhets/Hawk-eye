import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { FacultyService } from './faculty.service.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';
import { UpdateFacultyDto } from './dto/update-faculty.dto.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import { FacultyResponseDto } from './dto/faculty-response.dto.js';
import { ModuleResponseDto } from './dto/module-response.dto.js';

@ApiTags('Faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller()
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post('faculties')
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

  @Get('faculties')
  @ApiOperation({ summary: 'List all faculties' })
  @ApiResponse({
    status: 200,
    description: 'List of faculties',
    type: [FacultyResponseDto],
  })
  findAllFaculties(): Promise<FacultyResponseDto[]> {
    return this.facultyService.findAllFaculties();
  }

  @Get('faculties/:id')
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

  @Put('faculties/:id')
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

  @Delete('faculties/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a faculty' })
  @ApiResponse({ status: 204, description: 'Faculty deleted' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  deleteFaculty(@Param('id') id: string): Promise<void> {
    return this.facultyService.deleteFaculty(id);
  }

  @Post('faculties/:id/modules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a module to a faculty' })
  @ApiResponse({
    status: 201,
    description: 'Module created',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  createModule(
    @Param('id') facultyId: string,
    @Body() dto: CreateModuleDto,
  ): Promise<ModuleResponseDto> {
    dto.facultyId = facultyId;
    return this.facultyService.createModule(dto);
  }

  @Get('faculties/:id/modules')
  @ApiOperation({ summary: 'List modules in a faculty' })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    type: [ModuleResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  findModules(@Param('id') facultyId: string): Promise<ModuleResponseDto[]> {
    return this.facultyService.findModulesByFaculty(facultyId);
  }

  @Put('modules/:id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({
    status: 200,
    description: 'Module updated',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  updateModule(
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.facultyService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: 204, description: 'Module deleted' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  deleteModule(@Param('id') id: string): Promise<void> {
    return this.facultyService.deleteModule(id);
  }
}
