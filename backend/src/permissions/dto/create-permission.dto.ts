import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    @MaxLength(50)
    action: string;

    @IsString()
    @MaxLength(100)
    subject: string;

    @IsOptional()
    @IsObject()
    conditions?: Record<string, any>;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsOptional()
    @IsBoolean()
    inverted?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    reason?: string;
}
