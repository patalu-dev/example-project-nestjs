import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository, In, Like } from 'typeorm';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { permissionIds, ...roleData } = createRoleDto;
    const newRole = this.rolesRepository.create(roleData);

    if (permissionIds && permissionIds.length > 0) {
      newRole.permissions = await this.permissionsRepository.findBy({
        id: In(permissionIds),
      });
    }

    return this.rolesRepository.save(newRole);
  }

  async findAll(query?: { name?: string; page?: number; limit?: number }) {
    const page = query?.page ? +query.page : 1;
    const limit = query?.limit ? +query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.name) {
      where.name = Like(`%${query.name}%`);
    }

    const [items, total] = await this.rolesRepository.findAndCount({
      where,
      relations: ['permissions'],
      take: limit,
      skip: skip,
      order: { id: 'DESC' } as any,
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
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissionIds, ...updateData } = updateRoleDto;

    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role #${id} not found`);
    }

    Object.assign(role, updateData);

    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        role.permissions = await this.permissionsRepository.findBy({
          id: In(permissionIds),
        });
      } else {
        role.permissions = [];
      }
    }

    return this.rolesRepository.save(role);
  }

  remove(id: number) {
    return this.rolesRepository.delete(id);
  }
}
