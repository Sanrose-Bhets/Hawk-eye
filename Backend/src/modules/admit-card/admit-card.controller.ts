import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { AdmitCardService } from './admit-card.service.js';
import { GenerateAdmitCardsDto } from './dto/generate-admit-card.dto.js';
import { AdmitCardEntity } from './entities/admit-card.entity.js';

@ApiTags('Admit Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admit-cards')
export class AdmitCardController {
  constructor(private readonly admitCardService: AdmitCardService) {}

  @Post('generate')
  @Roles('RTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bulk generate admit cards for faculty+semester (RTE only)',
  })
  @ApiResponse({ status: 201, description: 'Admit cards generated' })
  generateBulk(
    @Request() req: { user: { id: string } },
    @Body() dto: GenerateAdmitCardsDto,
  ): Promise<{ generated: number; skipped: number; errors: string[] }> {
    return this.admitCardService.generateBulk(req.user.id, dto);
  }

  @Post('generate/:studentId')
  @Roles('RTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate admit cards for a single student (RTE only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Admit cards generated',
    type: [AdmitCardEntity],
  })
  generateSingle(
    @Request() req: { user: { id: string } },
    @Param('studentId') studentId: string,
    @Query('classId') classId?: string,
  ): Promise<AdmitCardEntity[]> {
    return this.admitCardService.generateSingle(
      req.user.id,
      studentId,
      classId,
    );
  }

  @Get()
  @Roles('RTE')
  @ApiOperation({ summary: 'List all admit cards (RTE only)' })
  @ApiResponse({
    status: 200,
    description: 'List of admit cards',
    type: [AdmitCardEntity],
  })
  findAll(): Promise<AdmitCardEntity[]> {
    return this.admitCardService.findAll();
  }

  @Get('student/me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student admit cards' })
  @ApiResponse({
    status: 200,
    description: 'Student admit cards',
    type: [AdmitCardEntity],
  })
  findMyCards(
    @Request() req: { user: { id: string } },
  ): Promise<AdmitCardEntity[]> {
    return this.admitCardService.findByStudentId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admit card by ID' })
  @ApiResponse({
    status: 200,
    description: 'Admit card details',
    type: AdmitCardEntity,
  })
  @ApiResponse({ status: 404, description: 'Admit card not found' })
  findOne(@Param('id') id: string): Promise<AdmitCardEntity> {
    return this.admitCardService.findById(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download admit card PDF' })
  @ApiResponse({ status: 200, description: 'PDF file' })
  @ApiResponse({ status: 404, description: 'Admit card or PDF not found' })
  async downloadPdf(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
    @Res() res: Response,
  ): Promise<void> {
    // Students can only access their own admit cards
    if (req.user.role === 'STUDENT') {
      const card = await this.admitCardService.findById(id);
      if (card.studentId !== req.user.id) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    }

    const pdfUrl = await this.admitCardService.getPdfUrl(id);
    res.redirect(pdfUrl);
  }

  @Delete(':id')
  @Roles('RTE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an admit card (RTE only)' })
  @ApiResponse({ status: 204, description: 'Admit card deleted' })
  @ApiResponse({ status: 404, description: 'Admit card not found' })
  remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ): Promise<void> {
    return this.admitCardService.delete(id, req.user.id);
  }
}
