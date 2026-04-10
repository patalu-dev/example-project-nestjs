import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(query?: { action?: string; subject?: string; page?: number; limit?: number }) {
    const page = query?.page ? +query.page : 1;
    const limit = query?.limit ? +query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.action) {
      where.action = Like(`%${query.action}%`);
    }
    if (query?.subject) {
      where.subject = Like(`%${query.subject}%`);
    }

    const [items, total] = await this.permissionsRepository.findAndCount({
      where,
      take: limit,
      skip: skip,
      order: { id: 'ASC' } as any,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const permission = await this.permissionsRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException(`Permission #${id} not found`);
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async remove(id: number) {
    const permission = await this.findOne(id);
    try {
      return await this.permissionsRepository.remove(permission);
    } catch (error) {
      if (error.errno === 1451 || error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException(
          'Không thể xóa quyền này vì đang được gắn với một hoặc nhiều vai trò. Vui lòng gỡ quyền này khỏi các vai trò trước khi thực hiện xóa.',
        );
      }
      throw error;
    }
  }


  /**
   * Get all unique actions that exist in the database
   */
  async getAvailableActions(): Promise<string[]> {
    const result = await this.permissionsRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.action', 'action')
      .getRawMany();
    return result.map((r) => r.action);
  }

  /**
   * Get all unique subjects that exist in the database
   */
  async getAvailableSubjects(): Promise<string[]> {
    const result = await this.permissionsRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.subject', 'subject')
      .getRawMany();
    return result.map((r) => r.subject);
  }
}
