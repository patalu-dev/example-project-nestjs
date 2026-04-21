import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, DeleteDateColumn, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../roles/entities/role.entity';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
@Unique(['username', 'deletedAt'])
@Unique(['email', 'deletedAt'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50 })
    username: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Exclude()
    @Column({ length: 255 })
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable()
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
