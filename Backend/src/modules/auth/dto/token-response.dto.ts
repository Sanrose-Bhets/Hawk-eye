import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/auth.entity.js';

export class TokenResponseDto {
  @ApiProperty({ type: User })
  user!: User;

  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}
