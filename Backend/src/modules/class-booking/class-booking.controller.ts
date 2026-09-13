import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { ClassBookingService } from './class-booking.service.js';
import { CreateClassBookingDto } from './dto/create-class-booking.dto.js';
import { ListClassBookingsDto } from './dto/list-class-bookings.dto.js';
import { ClassBookingEntity } from './entities/class-booking.entity.js';

@ApiTags('Class Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('class-bookings')
export class ClassBookingController {
  constructor(private readonly bookingService: ClassBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a class' })
  @ApiResponse({
    status: 201,
    description: 'Class booked',
    type: ClassBookingEntity,
  })
  @ApiResponse({ status: 409, description: 'Class already booked' })
  bookClass(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateClassBookingDto,
  ): Promise<ClassBookingEntity> {
    return this.bookingService.bookClass(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bookings' })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    type: [ClassBookingEntity],
  })
  listBookings(
    @Query() filters: ListClassBookingsDto,
  ): Promise<ClassBookingEntity[]> {
    return this.bookingService.listBookings(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: ClassBookingEntity,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getBooking(@Param('id') id: string): Promise<ClassBookingEntity> {
    return this.bookingService.getBooking(id);
  }

  @Patch(':id/free')
  @ApiOperation({ summary: 'Free a booked class' })
  @ApiResponse({
    status: 200,
    description: 'Class freed',
    type: ClassBookingEntity,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  freeClass(@Param('id') id: string): Promise<ClassBookingEntity> {
    return this.bookingService.freeClass(id);
  }
}
