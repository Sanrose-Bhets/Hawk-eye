import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { USER_REPOSITORY } from './constants/auth.constants.js';
import { RedisModule } from '../../common/redis/redis.module.js';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
