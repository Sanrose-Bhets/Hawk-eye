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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { StudentService } from './student.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { ImportStudentsDto } from './dto/import-students.dto.js';
import {
  StudentResponseDto,
  PaginatedStudentResponseDto,
  ImportStudentsResponseDto,
} from './dto/student-response.dto.js';

const ALLOWED_MIMES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 500 * 1024;

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT_SERVICE')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a student' })
  @ApiResponse({
    status: 201,
    description: 'Student created',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    return this.studentService.create(dto);
  }

  @Get()
  @Roles('STUDENT_SERVICE', 'STUDENT')
  @ApiOperation({
    summary: 'List all students with pagination, search, and faculty filter',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'faculty', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of students',
    type: PaginatedStudentResponseDto,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('faculty') faculty?: string,
  ): Promise<PaginatedStudentResponseDto> {
    return this.studentService.findAll({ page, limit, search, faculty });
  }

  @Get(':id')
  @Roles('STUDENT_SERVICE', 'STUDENT')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student details',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.studentService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({
    status: 200,
    description: 'Student updated',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.studentService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({ status: 204, description: 'Student deleted' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.studentService.delete(id);
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import students from CSV data' })
  @ApiResponse({
    status: 200,
    description: 'Import results',
    type: ImportStudentsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  importStudents(
    @Body() dto: ImportStudentsDto,
  ): Promise<ImportStudentsResponseDto> {
    return this.studentService.importStudents(dto.students);
  }

  @Get(':id/image')
  @Roles('STUDENT_SERVICE', 'STUDENT')
  @ApiOperation({
    summary: 'Get student image URL',
    description: 'Returns a time-limited presigned URL for the student image',
  })
  @ApiResponse({ status: 200, description: 'Image URL' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getImage(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.studentService.getImageUrl(id);
    return { url };
  }

  @Post(':id/image')
  @Roles('STUDENT_SERVICE', 'STUDENT')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Only JPG, JPEG, and PNG files are allowed',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiOperation({
    summary: 'Upload student image',
    description:
      'Upload a profile image for a student. Allowed formats: JPG, JPEG, PNG. Max file size: 500KB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, JPEG, or PNG, max 500KB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded and optimized',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type, file too large, or missing file',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  uploadImage(
    @Param('id') id: string,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; originalname: string },
  ): Promise<StudentResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.studentService.uploadImage(id, file.buffer, file.mimetype);
  }
}
