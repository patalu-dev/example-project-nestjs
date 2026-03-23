import { IsString, IsOptional, IsArray, IsNumber, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @MaxLength(50)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    permissionIds?: number[];
}
