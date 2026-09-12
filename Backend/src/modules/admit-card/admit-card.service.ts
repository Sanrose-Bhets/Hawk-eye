import {
  Injectable,
  NotFoundException,
  Inject,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { ADMIT_CARD_REPOSITORY } from './constants/admit-card.constants.js';
import { STUDENT_REPOSITORY } from '../student/constants/student.constants.js';
import { EXAM_ROUTINE_REPOSITORY } from '../exam-routine/constants/exam-routine.constants.js';
import { MODULE_REPOSITORY } from '../module/constants/module.constants.js';
import { FACULTY_REPOSITORY } from '../faculty/constants/faculty.constants.js';
import type { IAdmitCardRepository } from './interfaces/admit-card.repository.interface.js';
import type { IStudentRepository } from '../student/interfaces/student.repository.interface.js';
import type { IExamRoutineRepository } from '../exam-routine/interfaces/exam-routine.repository.interface.js';
import type { IModuleRepository } from '../module/interfaces/module.repository.interface.js';
import type { IFacultyRepository } from '../faculty/interfaces/faculty.repository.interface.js';
import type { ClassRepository } from '../seat-plan/repositories/class.repository.js';
import { CLASS_REPOSITORY } from '../seat-plan/constants/seat-plan.constants.js';
import { GenerateAdmitCardsDto } from './dto/generate-admit-card.dto.js';
import { AdmitCardEntity } from './entities/admit-card.entity.js';
import { toAdmitCard } from './factories/admit-card.factory.js';
import { generateAdmitCardPdf } from './admit-card.pdf-generator.js';
import { CacheService } from '../../common/cache/cache.service.js';
import { FILE_STORAGE } from '../../common/file-storage/file-storage.constants.js';
import type { IFileStorage } from '../../common/file-storage/file-storage.interface.js';

function now() {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

@Injectable()
export class AdmitCardService {
  private readonly logger = new Logger(AdmitCardService.name);

  constructor(
    @Inject(ADMIT_CARD_REPOSITORY)
    private readonly admitCardRepo: IAdmitCardRepository,
    @Inject(STUDENT_REPOSITORY)
    private readonly studentRepo: IStudentRepository,
    @Inject(EXAM_ROUTINE_REPOSITORY)
    private readonly examRoutineRepo: IExamRoutineRepository,
    @Inject(MODULE_REPOSITORY)
    private readonly moduleRepo: IModuleRepository,
    @Inject(FACULTY_REPOSITORY)
    private readonly facultyRepo: IFacultyRepository,
    @Inject(CLASS_REPOSITORY)
    private readonly classRepo: ClassRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: IFileStorage,
    private readonly cache: CacheService,
  ) {}

  private async resolveNames(moduleId: string, facultyId: string) {
    let modules = await this.cache.get<any[]>('modules:all');
    if (!modules) {
      modules = await this.moduleRepo.findAll();
      await this.cache.set('modules:all', modules, 3600);
    }
    const mod = modules.find((m) => m.id === moduleId);

    let faculties = await this.cache.get<any[]>('faculties:all');
    if (!faculties) {
      faculties = await this.facultyRepo.findAll();
      await this.cache.set('faculties:all', faculties, 3600);
    }
    const fac = faculties.find((f) => f.id === facultyId);

    return { moduleName: mod?.name, moduleCode: mod?.code, facultyName: fac?.name };
  }

  private async enrich(card: any): Promise<AdmitCardEntity> {
    const student = await this.studentRepo.findById(card.studentId);
    const routine = await this.examRoutineRepo.findById(card.examRoutineId);
    if (!routine) return toAdmitCard(card);

    const names = await this.resolveNames(routine.moduleId, routine.facultyId);
    return toAdmitCard(card, {
      studentName: student?.name,
      studentEmail: student?.email,
      moduleName: names.moduleName,
      moduleCode: names.moduleCode,
      facultyName: names.facultyName,
      examDate: routine.date,
      startTime: routine.startTime,
      endTime: routine.endTime,
      duration: routine.duration,
    });
  }

  async generateBulk(
    rteId: string,
    dto: GenerateAdmitCardsDto,
  ): Promise<{ generated: number; skipped: number; errors: string[] }> {
    const students = await this.studentRepo.findAll();
    const targetStudents = students.filter(
      (s) => s.facultyId === dto.facultyId && s.semester === dto.semester,
    );

    if (targetStudents.length === 0) {
      throw new BadRequestException('No students found for the given faculty and semester');
    }

    // Find exam routines for this faculty
    const allRoutines = await this.examRoutineRepo.findAll();
    const facultyRoutines = allRoutines.filter(
      (r) => r.facultyId === dto.facultyId,
    );

    if (facultyRoutines.length === 0) {
      throw new BadRequestException('No exam routines found for the given faculty');
    }

    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Load class assignments if classId provided
    let classAssignments: any[] = [];
    let className = 'Main Hall';
    if (dto.classId) {
      try {
        const cls = await this.classRepo.findById(dto.classId);
        if (cls) {
          classAssignments = (cls.assignments as any[]) || [];
          className = cls.name;
        }
      } catch {
        // class not found, proceed without seating
      }
    }

    let seatCounter = 1;

    for (const student of targetStudents) {
      for (const routine of facultyRoutines) {
        try {
          const existing = await this.admitCardRepo.findUnique(
            student.id,
            routine.id,
          );
          if (existing) {
            skipped++;
            continue;
          }

          // Find seating assignment from the selected class
          const assignment = classAssignments.find(
            (a: any) => a.studentEmail === student.email,
          );
          const seatNumber = assignment
            ? String(assignment.seatIndex + 1)
            : String(seatCounter++);
          const roomName = className;

          const ts = now();
          const card = await this.admitCardRepo.create({
            studentId: student.id,
            examRoutineId: routine.id,
            seatNumber,
            roomName,
            generatedBy: rteId,
            createdAt: ts,
            updatedAt: ts,
          });

          // Generate PDF
          const routineNames = await this.resolveNames(
            routine.moduleId,
            routine.facultyId,
          );
          const faculty = await this.facultyRepo.findAll();
          const fac = faculty.find((f) => f.id === student.facultyId);

          try {
            const pdfBuffer = await generateAdmitCardPdf({
              studentName: student.name,
              studentEmail: student.email,
              studentContact: student.contact,
              parentEmail: student.parentEmail,
              facultyName: fac?.name ?? 'Unknown',
              semester: student.semester,
              moduleName: routineNames.moduleName ?? 'Unknown',
              moduleCode: routineNames.moduleCode ?? null,
              examDate:
                typeof (routine.date as any)?.epochMilliseconds === 'number'
                  ? new Date((routine.date as any).epochMilliseconds).toISOString()
                  : new Date(routine.date as string).toISOString(),
              startTime: routine.startTime,
              endTime: routine.endTime,
              duration: routine.duration,
              seatNumber: seatNumber ?? 'N/A',
              roomName: roomName ?? 'N/A',
              admitCardId: card.id,
            });

            const pdfKey = `admit-cards/${card.id}.pdf`;
            await this.fileStorage.upload(pdfBuffer, pdfKey, 'application/pdf');
            await this.admitCardRepo.update(card.id, {
              pdfKey,
              updatedAt: now(),
            });
          } catch (pdfErr) {
            this.logger.error(
              `Failed to generate PDF for admit card ${card.id}: ${pdfErr}`,
            );
          }

          generated++;
        } catch (err) {
          errors.push(
            `Student ${student.name}: ${err instanceof Error ? err.message : 'Unknown error'}`,
          );
        }
      }
    }

    await this.cache.invalidatePattern('admitcards:*');
    return { generated, skipped, errors };
  }

  async generateSingle(
    rteId: string,
    studentId: string,
    classId?: string,
  ): Promise<AdmitCardEntity[]> {
    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Find exam routines for student's faculty
    const allRoutines = await this.examRoutineRepo.findAll();
    const facultyRoutines = allRoutines.filter(
      (r) => r.facultyId === student.facultyId,
    );

    if (facultyRoutines.length === 0) {
      throw new BadRequestException('No exam routines found for student faculty');
    }

    // Get seating from class if provided
    let classAssignments: any[] = [];
    let className = 'Main Hall';
    if (classId) {
      try {
        const cls = await this.classRepo.findById(classId);
        if (cls) {
          classAssignments = (cls.assignments as any[]) || [];
          className = cls.name;
        }
      } catch {
        // proceed without seating
      }
    }

    const created: AdmitCardEntity[] = [];
    let seatCounter = 1;

    for (const routine of facultyRoutines) {
      const existing = await this.admitCardRepo.findUnique(
        student.id,
        routine.id,
      );
      if (existing) continue;

      const assignment = classAssignments.find(
        (a: any) => a.studentEmail === student.email,
      );
      const seatNumber = assignment
        ? String(assignment.seatIndex + 1)
        : String(seatCounter++);
      const roomName = className;

      const ts = now();
      const card = await this.admitCardRepo.create({
        studentId: student.id,
        examRoutineId: routine.id,
        seatNumber,
        roomName,
        generatedBy: rteId,
        createdAt: ts,
        updatedAt: ts,
      });

      // Generate PDF
      const routineNames = await this.resolveNames(
        routine.moduleId,
        routine.facultyId,
      );
      const faculty = await this.facultyRepo.findAll();
      const fac = faculty.find((f) => f.id === student.facultyId);

      try {
        const pdfBuffer = await generateAdmitCardPdf({
          studentName: student.name,
          studentEmail: student.email,
          studentContact: student.contact,
          parentEmail: student.parentEmail,
          facultyName: fac?.name ?? 'Unknown',
          semester: student.semester,
          moduleName: routineNames.moduleName ?? 'Unknown',
          moduleCode: routineNames.moduleCode ?? null,
          examDate:
            typeof (routine.date as any)?.epochMilliseconds === 'number'
              ? new Date((routine.date as any).epochMilliseconds).toISOString()
              : new Date(routine.date as string).toISOString(),
          startTime: routine.startTime,
          endTime: routine.endTime,
          duration: routine.duration,
          seatNumber: seatNumber ?? 'N/A',
          roomName: roomName ?? 'N/A',
          admitCardId: card.id,
        });

        const pdfKey = `admit-cards/${card.id}.pdf`;
        await this.fileStorage.upload(pdfBuffer, pdfKey, 'application/pdf');
        await this.admitCardRepo.update(card.id, {
          pdfKey,
          updatedAt: now(),
        });
      } catch (pdfErr) {
        this.logger.error(
          `Failed to generate PDF for admit card ${card.id}: ${pdfErr}`,
        );
      }

      created.push(await this.enrich(card));
    }

    await this.cache.invalidatePattern('admitcards:*');
    return created;
  }

  async findAll(): Promise<AdmitCardEntity[]> {
    let cards = await this.cache.get<any[]>('admitcards:all');
    if (!cards) {
      cards = await this.admitCardRepo.findAll();
      await this.cache.set('admitcards:all', cards, 300);
    }

    const enriched = await Promise.all(cards.map((c) => this.enrich(c)));
    return enriched;
  }

  async findById(id: string): Promise<AdmitCardEntity> {
    const card = await this.admitCardRepo.findById(id);
    if (!card) {
      throw new NotFoundException('Admit card not found');
    }
    return this.enrich(card);
  }

  async findByStudentId(studentId: string): Promise<AdmitCardEntity[]> {
    const cards = await this.admitCardRepo.findByStudentId(studentId);
    return Promise.all(cards.map((c) => this.enrich(c)));
  }

  async getPdfKey(id: string): Promise<string> {
    const card = await this.admitCardRepo.findById(id);
    if (!card) {
      throw new NotFoundException('Admit card not found');
    }
    if (!card.pdfKey) {
      throw new NotFoundException('PDF not generated yet');
    }
    return card.pdfKey;
  }

  async getPdfUrl(id: string): Promise<string> {
    const pdfKey = await this.getPdfKey(id);
    return this.fileStorage.getUrl(pdfKey);
  }

  async delete(id: string, rteId: string): Promise<void> {
    const card = await this.admitCardRepo.findById(id);
    if (!card) {
      throw new NotFoundException('Admit card not found');
    }
    if (card.generatedBy !== rteId) {
      throw new ForbiddenException('Access denied');
    }

    if (card.pdfKey) {
      try {
        await this.fileStorage.delete(card.pdfKey);
      } catch {
        // ignore cleanup errors
      }
    }

    await this.admitCardRepo.delete(id);
    await this.cache.invalidatePattern('admitcards:*');
  }
}
