import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = db;

  async onModuleInit() {
    // Client initializes on first query; no explicit connect needed
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  get orm() {
    return this.client.orm;
  }
}
