import { Global, Module } from '@nestjs/common';
import { FILE_STORAGE } from './file-storage.constants.js';
import { S3FileStorageService } from './implementations/s3/s3-file-storage.service.js';
import { LocalFileStorageService } from './implementations/local/local-file-storage.service.js';

const storageProvider = {
  provide: FILE_STORAGE,
  useClass:
    process.env.FILE_STORAGE_TYPE === 's3'
      ? S3FileStorageService
      : LocalFileStorageService,
};

@Global()
@Module({
  providers: [storageProvider],
  exports: [FILE_STORAGE],
})
export class FileStorageModule {}
