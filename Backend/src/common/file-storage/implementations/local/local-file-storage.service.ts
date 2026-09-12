import { Injectable, Logger } from '@nestjs/common';
import { writeFile, unlink, access, mkdir } from 'fs/promises';
import { join } from 'path';
import type { IFileStorage } from '../../file-storage.interface.js';

const UPLOAD_DIR = join('..', 'uploads');

@Injectable()
export class LocalFileStorageService implements IFileStorage {
  private readonly logger = new Logger(LocalFileStorageService.name);

  async upload(
    buffer: Buffer,
    key: string,
    _contentType: string,
  ): Promise<string> {
    const filePath = join(UPLOAD_DIR, key);
    const dir = join(UPLOAD_DIR, key.split('/').slice(0, -1).join('/'));

    await access(dir).catch(() => mkdir(dir, { recursive: true }));
    await writeFile(filePath, buffer);

    this.logger.log(`File stored locally: ${key}`);
    return key;
  }

  async delete(key: string): Promise<void> {
    const filePath = join(UPLOAD_DIR, key);
    await unlink(filePath).catch(() => {
      this.logger.warn(`File not found for deletion: ${key}`);
    });
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}
