import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { TokenResponseDto } from './dto/token-response.dto.js';
import type { IUserRepository } from './interfaces/user.repository.interface.js';
import { toUser } from './factories/user.factory.js';
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
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
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

    return this.generateTokens(user.id, user.email, user.role);
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

    const user = await this.userRepo.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(id: string, email: string, role: string): TokenResponseDto {
    const accessPayload: JwtPayload = { sub: id, email, role, type: 'access' };
    const refreshPayload: JwtPayload = { sub: id, email, role, type: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: JWT_SECRET,
      expiresIn: JWT_ACCESS_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRY,
    });

    return {
      user: toUser({ id, email, role }),
      accessToken,
      refreshToken,
    };
  }
}
