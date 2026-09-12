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
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { SeatPlanService } from './seat-plan.service.js';
import { CreateFloorPlanDto } from './dto/create-floor-plan.dto.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateFloorPlanDto } from './dto/update-floor-plan.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import {
  FloorPlanResponseDto,
  ClassResponseDto,
} from './dto/seat-plan-response.dto.js';

@ApiTags('Seat Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seat-plans')
export class SeatPlanController {
  constructor(private readonly seatPlanService: SeatPlanService) {}

  // --- Floor Plans ---

  @Post('floor-plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a floor plan' })
  @ApiResponse({
    status: 201,
    description: 'Floor plan created',
    type: FloorPlanResponseDto,
  })
  createFloorPlan(
    @Body() dto: CreateFloorPlanDto,
  ): Promise<FloorPlanResponseDto> {
    return this.seatPlanService.createFloorPlan(dto);
  }

  @Get('floor-plans')
  @ApiOperation({ summary: 'List all floor plans' })
  @ApiResponse({
    status: 200,
    description: 'List of floor plans',
    type: [FloorPlanResponseDto],
  })
  getFloorPlans(): Promise<FloorPlanResponseDto[]> {
    return this.seatPlanService.getFloorPlans();
  }

  @Get('floor-plans/:id')
  @ApiOperation({ summary: 'Get a floor plan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Floor plan details',
    type: FloorPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Floor plan not found' })
  getFloorPlan(@Param('id') id: string): Promise<FloorPlanResponseDto> {
    return this.seatPlanService.getFloorPlan(id);
  }

  @Put('floor-plans/:id')
  @ApiOperation({ summary: 'Update a floor plan' })
  @ApiResponse({
    status: 200,
    description: 'Floor plan updated',
    type: FloorPlanResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Floor plan not found' })
  updateFloorPlan(
    @Param('id') id: string,
    @Body() dto: UpdateFloorPlanDto,
  ): Promise<FloorPlanResponseDto> {
    return this.seatPlanService.updateFloorPlan(id, dto);
  }

  @Delete('floor-plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a floor plan' })
  @ApiResponse({ status: 204, description: 'Floor plan deleted' })
  @ApiResponse({ status: 404, description: 'Floor plan not found' })
  deleteFloorPlan(@Param('id') id: string): Promise<void> {
    return this.seatPlanService.deleteFloorPlan(id);
  }

  // --- Classes ---

  @Post('classes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a class' })
  @ApiResponse({
    status: 201,
    description: 'Class created',
    type: ClassResponseDto,
  })
  createClass(@Body() dto: CreateClassDto): Promise<ClassResponseDto> {
    return this.seatPlanService.createClass(dto);
  }

  @Get('classes')
  @ApiOperation({ summary: 'List all classes' })
  @ApiResponse({
    status: 200,
    description: 'List of classes',
    type: [ClassResponseDto],
  })
  getClasses(): Promise<ClassResponseDto[]> {
    return this.seatPlanService.getClasses();
  }

  @Get('classes/:id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getClass(@Param('id') id: string): Promise<ClassResponseDto> {
    return this.seatPlanService.getClass(id);
  }

  @Put('classes/:id')
  @ApiOperation({ summary: 'Update a class' })
  @ApiResponse({
    status: 200,
    description: 'Class updated',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  updateClass(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ): Promise<ClassResponseDto> {
    return this.seatPlanService.updateClass(id, dto);
  }

  @Delete('classes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 204, description: 'Class deleted' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  deleteClass(@Param('id') id: string): Promise<void> {
    return this.seatPlanService.deleteClass(id);
  }
}
