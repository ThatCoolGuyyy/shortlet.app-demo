import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserRole } from '../database/entities/User';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn(['host', 'guest'])
  @IsOptional()
  role: UserRole = 'host';
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
