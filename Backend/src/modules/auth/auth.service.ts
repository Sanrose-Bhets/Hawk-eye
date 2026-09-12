import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import type { IUserRepository } from './interfaces/user.repository.interface.js';
import { toUser } from './factories/user.factory.js';
import { RedisService } from '../../common/redis/redis.service.js';
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  USER_REPOSITORY,
} from './constants/auth.constants.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  facultyId?: string | null;
  semester?: number | null;
  type: 'access' | 'refresh';
}

const REFRESH_TOKEN_PREFIX = 'refresh:';
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async login(dto: LoginAuthDto): Promise<TokenResponseDto> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role, user.facultyId, user.semester);
    await this.storeRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const stored = await this.redis.get(
      `${REFRESH_TOKEN_PREFIX}${refreshToken}`,
    );
    if (!stored) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    await this.redis.del(`${REFRESH_TOKEN_PREFIX}${refreshToken}`);

    const user = await this.userRepo.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.facultyId,
      user.semester,
    );
    await this.storeRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  private async storeRefreshToken(
    token: string,
    userId: string,
  ): Promise<void> {
    await this.redis.set(
      `${REFRESH_TOKEN_PREFIX}${token}`,
      userId,
      REFRESH_TOKEN_TTL_SECONDS,
    );
  }

  private generateTokens(
    id: string,
    email: string,
    role: string,
    facultyId?: string | null,
    semester?: number | null,
  ): TokenResponseDto {
    const accessPayload: JwtPayload = {
      sub: id,
      email,
      role,
      facultyId,
      semester,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: id,
      email,
      role,
      facultyId,
      semester,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: JWT_SECRET,
      expiresIn: JWT_ACCESS_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRY,
    });

    return {
      user: toUser({ id, email, role, facultyId, semester }),
      accessToken,
      refreshToken,
    };
  }
}
