import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JWT_SECRET } from '../modules/auth/constants/auth.constants.js';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class CommonModule {}
