import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { BackupService } from './backup.service.js';
import { ImportBackupDto } from './dto/import-backup.dto.js';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE', 'RTE')
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('export')
  @ApiOperation({
    summary:
      'Export scoped data as a JSON backup file (Student Service or RTE only)',
  })
  @ApiResponse({ status: 200, description: 'JSON backup file' })
  @ApiResponse({ status: 403, description: 'Forbidden role' })
  async exportBackup(
    @Request()
    req: { user: { role: string } },
    @Res() res: Response,
  ): Promise<void> {
    const backup = await this.backupService.exportBackup(req.user.role);
    const jsonContent = JSON.stringify(backup, null, 2);
    const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonContent);
  }

  @Get('preview')
  @ApiOperation({ summary: 'Preview scoped backup data counts' })
  @ApiResponse({ status: 200, description: 'Data counts' })
  @ApiResponse({ status: 403, description: 'Forbidden role' })
  async preview(
    @Request()
    req: {
      user: { role: string };
    },
  ): Promise<Record<string, number>> {
    return this.backupService.getPreview(req.user.role);
  }

  @Post('import')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import scoped data from a backup (replaces only your role data)',
  })
  @ApiResponse({ status: 200, description: 'Import results' })
  @ApiResponse({ status: 400, description: 'Invalid backup format' })
  @ApiResponse({ status: 403, description: 'Forbidden role' })
  async importBackup(
    @Request()
    req: { user: { role: string } },
    @Body() dto: ImportBackupDto,
  ): Promise<{ imported: Record<string, number> }> {
    return this.backupService.importBackup(dto, req.user.role);
  }
}
