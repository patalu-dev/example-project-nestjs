import { IsString, IsEmail, IsBoolean, MinLength, MaxLength, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @IsBoolean()
    isActive: boolean;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    roleIds?: number[];
}
