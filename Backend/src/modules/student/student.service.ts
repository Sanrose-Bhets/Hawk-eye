import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { STUDENT_REPOSITORY } from './constants/student.constants.js';
import { FILE_STORAGE } from '../../common/file-storage/file-storage.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import type { IStudentRepository } from './interfaces/student.repository.interface.js';
import type { IFileStorage } from '../../common/file-storage/file-storage.interface.js';
import type { IFacultyRepository } from '../faculty/interfaces/faculty.repository.interface.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentEntity } from './entities/student.entity.js';
import { toStudent } from './factories/student.factory.js';

const DEFAULT_PASSWORD = 'student123';
const SALT_ROUNDS = 10;

@Injectable()
export class StudentService {
  constructor(
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepo: IStudentRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: IFileStorage,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const existing = await this.studentRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Student with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const now = new Date();

    const model = await this.studentRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      address: dto.address,
      contact: dto.contact,
      parentEmail: dto.parentEmail,
      facultyId: dto.facultyId,
      createdAt: now,
      updatedAt: now,
    });

    return toStudent(model);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    faculty?: string;
  }): Promise<{
    data: StudentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    let all = await this.studentRepo.findAll();

    if (filters.faculty) {
      const faculty = await this.facultyRepo.findByName(filters.faculty);
      if (faculty) {
        all = all.filter((s) => s.facultyId === faculty.id);
      } else {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.contact.toLowerCase().includes(q),
      );
    }

    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paged = all.slice(offset, offset + limit);

    return {
      data: paged.map(toStudent),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<StudentEntity> {
    const model = await this.studentRepo.findById(id);
    if (!model) {
      throw new NotFoundException('Student not found');
    }
    return toStudent(model);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentEntity> {
    const existing = await this.studentRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) {
      const emailTaken = await this.studentRepo.findByEmail(dto.email);
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictException('Student with this email already exists');
      }
      updateData.email = dto.email;
    }
    if (dto.password !== undefined) {
      updateData.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.contact !== undefined) updateData.contact = dto.contact;
    if (dto.parentEmail !== undefined) updateData.parentEmail = dto.parentEmail;
    if (dto.facultyId !== undefined) updateData.facultyId = dto.facultyId;

    await this.studentRepo.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.studentRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }
    if (existing.image) {
      await this.fileStorage.delete(existing.image);
    }
    await this.studentRepo.delete(id);
  }

  async importStudents(
    dtos: CreateStudentDto[],
  ): Promise<{ created: number; errors: { email: string; reason: string }[] }> {
    const errors: { email: string; reason: string }[] = [];
    let created = 0;

    for (const dto of dtos) {
      try {
        const existing = await this.studentRepo.findByEmail(dto.email);
        if (existing) {
          errors.push({ email: dto.email, reason: 'Email already exists' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(
          dto.password || DEFAULT_PASSWORD,
          SALT_ROUNDS,
        );
        const now = new Date();

        await this.studentRepo.create({
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          address: dto.address,
          contact: dto.contact,
          parentEmail: dto.parentEmail,
          facultyId: dto.facultyId,
          createdAt: now,
          updatedAt: now,
        });

        created++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ email: dto.email, reason: message });
      }
    }

    return { created, errors };
  }

  async getImageUrl(id: string): Promise<string> {
    const existing = await this.studentRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }
    if (!existing.image) {
      throw new NotFoundException('Student has no image');
    }
    return this.fileStorage.getUrl(existing.image);
  }

  async uploadImage(
    id: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<StudentEntity> {
    const existing = await this.studentRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    if (existing.image) {
      await this.fileStorage.delete(existing.image);
    }

    let optimized: Buffer;
    const metadata = await sharp(buffer).metadata();

    if (metadata.format === 'jpeg') {
      optimized = await sharp(buffer)
        .jpeg({ quality: 100, progressive: true })
        .toBuffer();
    } else if (metadata.format === 'png') {
      optimized = await sharp(buffer)
        .png({ quality: 100, compressionLevel: 9 })
        .toBuffer();
    } else {
      throw new BadRequestException('Unsupported image format');
    }

    const ext = contentType === 'image/png' ? 'png' : 'jpeg';
    const key = `students/${randomUUID()}.${ext}`;
    const uploadedKey = await this.fileStorage.upload(
      optimized,
      key,
      contentType,
    );

    await this.studentRepo.update(id, {
      image: uploadedKey,
      updatedAt: new Date(),
    });

    return this.findById(id);
  }
}
