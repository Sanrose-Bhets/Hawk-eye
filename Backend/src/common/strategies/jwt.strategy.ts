import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../../modules/auth/constants/auth.constants.js';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET!,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
