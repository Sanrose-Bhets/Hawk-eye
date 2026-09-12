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
import { ModuleService } from './module.service.js';
import { CreateModuleDto } from './dto/create-module.dto.js';
import { UpdateModuleDto } from './dto/update-module.dto.js';
import {
  ModuleResponseDto,
  PaginatedModuleResponseDto,
} from './dto/module-response.dto.js';

@ApiTags('Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a module' })
  @ApiResponse({
    status: 201,
    description: 'Module created',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Faculty not found' })
  create(@Body() dto: CreateModuleDto): Promise<ModuleResponseDto> {
    return this.moduleService.create(dto);
  }

  @Get()
  @Roles('STUDENT_SERVICE', 'RTE')
  @ApiOperation({ summary: 'List all modules with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'faculty', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of modules',
    type: PaginatedModuleResponseDto,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('faculty') faculty?: string,
  ): Promise<PaginatedModuleResponseDto> {
    return this.moduleService.findAll({ page, limit, search, faculty });
  }

  @Get(':id')
  @Roles('STUDENT_SERVICE', 'RTE')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiResponse({
    status: 200,
    description: 'Module details',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Module not found' })
  findOne(@Param('id') id: string): Promise<ModuleResponseDto> {
    return this.moduleService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({
    status: 200,
    description: 'Module updated',
    type: ModuleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.moduleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: 204, description: 'Module deleted' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.moduleService.delete(id);
  }
}
