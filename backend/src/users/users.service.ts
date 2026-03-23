import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { roleIds, ...userData } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password || '123456', salt);
    
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roles: roleIds ? roleIds.map(id => ({ id })) : [],
    } as any);
    
    return this.usersRepository.save(newUser);
  }

  async findAll(query?: { name?: string; username?: string; email?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const page = query?.page ? +query.page : 1;
    const limit = query?.limit ? +query.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (query?.name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query?.username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${query.username}%` });
    }
    if (query?.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${query.email}%` });
    }
    if (query?.status) {
      if (query.status === 'active') {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: true });
      } else if (query.status === 'inactive') {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: false });
      }
    }
    if (query?.role) {
      const roles = query.role.split(',');
      queryBuilder.innerJoin('user.roles', 'role_filter', 'role_filter.name IN (:...roles)', { roles });
    }

    const [items, total] = await queryBuilder
      .orderBy('user.id', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  findByUsername(username: string) {
    return this.usersRepository.findOneBy({ username });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, ...updateData } = updateUserDto;
    
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Update basic fields
    Object.assign(user, updateData);
    
    // Update relations
    if (roleIds) {
      user.roles = roleIds.map(id => ({ id } as any));
    }
    
    return this.usersRepository.save(user);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
