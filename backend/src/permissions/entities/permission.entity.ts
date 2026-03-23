import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    action: string; // e.g. 'create', 'read', 'update', 'delete', 'manage'

    @Column({ length: 100 })
    subject: string; // e.g. 'User', 'Role', 'all'

    @Column({ type: 'json', nullable: true })
    conditions: Record<string, any>; // e.g. { id: '${user.id}' } for conditional permissions

    @Column({ length: 255, nullable: true })
    description: string; // Human-readable description

    @Column({ default: false })
    inverted: boolean; // true = "cannot", false = "can"

    @Column({ length: 255, nullable: true })
    reason: string; // Reason message when permission is denied (for inverted permissions)

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
