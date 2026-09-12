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
import { ResultsService } from './results.service.js';
import { CreateResultDto } from './dto/create-result.dto.js';
import { UpdateResultDto } from './dto/update-result.dto.js';
import { ImportResultsDto } from './dto/import-results.dto.js';
import {
  ResultResponseDto,
  PaginatedResultResponseDto,
  ImportResultsResponseDto,
} from './dto/result-response.dto.js';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update results for a student' })
  @ApiResponse({
    status: 201,
    description: 'Result created',
    type: ResultResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Student or module not found' })
  create(@Body() dto: CreateResultDto): Promise<ResultResponseDto> {
    return this.resultsService.create(dto);
  }

  @Get()
  @Roles('STUDENT_SERVICE', 'RTE')
  @ApiOperation({
    summary: 'List all results with pagination, search, and filters',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'grade', required: false, type: String })
  @ApiQuery({ name: 'published', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of results',
    type: PaginatedResultResponseDto,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('grade') grade?: string,
    @Query('published') published?: string,
  ): Promise<PaginatedResultResponseDto> {
    return this.resultsService.findAll({
      page,
      limit,
      search,
      grade,
      published,
    });
  }

  @Get(':id')
  @Roles('STUDENT_SERVICE', 'RTE')
  @ApiOperation({ summary: 'Get a result by ID' })
  @ApiResponse({
    status: 200,
    description: 'Result details',
    type: ResultResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Result not found' })
  findOne(@Param('id') id: string): Promise<ResultResponseDto> {
    return this.resultsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a result' })
  @ApiResponse({
    status: 200,
    description: 'Result updated',
    type: ResultResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
  ): Promise<ResultResponseDto> {
    return this.resultsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a result' })
  @ApiResponse({ status: 204, description: 'Result deleted' })
  @ApiResponse({ status: 404, description: 'Result not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.resultsService.delete(id);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import results from CSV data' })
  @ApiResponse({
    status: 200,
    description: 'Import results',
    type: ImportResultsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  importResults(
    @Body() dto: ImportResultsDto,
  ): Promise<ImportResultsResponseDto> {
    return this.resultsService.importResults(dto.items);
  }

  @Post('publish-all')
  @HttpCode(HttpStatus.OK)
  @Roles('RTE')
  @ApiOperation({ summary: 'Publish all unpublished results (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'All unpublished results published',
  })
  publishAll(): Promise<{ published: number; emailed: number }> {
    return this.resultsService.publishAll();
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.OK)
  @Roles('RTE')
  @ApiOperation({ summary: 'Publish or unpublish a result (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'Result publish status updated',
    type: ResultResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Result not found' })
  publish(
    @Param('id') id: string,
    @Body('published') published: boolean,
  ): Promise<ResultResponseDto> {
    return this.resultsService.publish(id, published);
  }
}
