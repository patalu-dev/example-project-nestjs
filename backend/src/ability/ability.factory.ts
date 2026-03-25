import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

// Subject map - maps subject strings from database to actual classes
// When you add new entities, register them here so CASL can resolve them
const subjectMap: Record<string, any> = {
  all: 'all',
  User: User,
  Role: Role,
  Permission: Permission,
};

export type Subjects = InferSubjects<typeof User | typeof Role | typeof Permission> | 'all';

export type AppAbility = Ability<[string, Subjects]>;

@Injectable()
export class AbilityFactory {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async defineAbility(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    // Load user with roles and permissions from database
    const fullUser = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!fullUser || !fullUser.roles) {
      // No roles found - give no permissions
      return build({
        detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
      });
    }

    // Collect all permissions from all roles
    const allPermissions = fullUser.roles.flatMap((role) => role.permissions || []);

    // Remove duplicate permissions (same action + subject + inverted)
    const uniquePermissions = allPermissions.filter(
      (perm, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.action === perm.action &&
            p.subject === perm.subject &&
            p.inverted === perm.inverted,
        ),
    );

    // Apply "can" permissions first, then "cannot" permissions
    const canPermissions = uniquePermissions.filter((p) => !p.inverted);
    const cannotPermissions = uniquePermissions.filter((p) => p.inverted);

    for (const perm of canPermissions) {
      const subject = subjectMap[perm.subject] || perm.subject;
      if (perm.conditions) {
        // Replace template variables like ${user.id} with actual values
        const resolvedConditions = this.resolveConditions(perm.conditions, fullUser);
        can(perm.action, subject, resolvedConditions);
      } else {
        can(perm.action, subject);
      }
    }

    for (const perm of cannotPermissions) {
      const subject = subjectMap[perm.subject] || perm.subject;
      if (perm.conditions) {
        const resolvedConditions = this.resolveConditions(perm.conditions, fullUser);
        const rule = cannot(perm.action, subject, resolvedConditions);
        if (perm.reason) rule.because(perm.reason);
      } else {
        const rule = cannot(perm.action, subject);
        if (perm.reason) rule.because(perm.reason);
      }
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  /**
   * Resolve template variables in conditions
   * e.g., { id: '${user.id}' } => { id: 1 }
   */
  private resolveConditions(
    conditions: Record<string, any>,
    user: User,
  ): Record<string, any> {
    const resolved: Record<string, any> = {};
    for (const [key, value] of Object.entries(conditions)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const path = value.slice(2, -1); // Remove ${ and }
        resolved[key] = this.getNestedValue(user, path);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
