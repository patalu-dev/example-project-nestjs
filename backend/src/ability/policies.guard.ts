import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory, AppAbility } from './ability.factory';
import { CHECK_POLICIES_KEY, RequiredRule } from './check-policies.decorator';
import { ForbiddenError } from '@casl/ability';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<RequiredRule[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    
    // Create ability for current user (now async - loads from database)
    const ability = await this.abilityFactory.defineAbility(user);

    try {
      for (const handler of policyHandlers) {
        const can = ability.can(handler.action, handler.subject as any);
        if (!can) {
          throw new ForbiddenException(handler.message || 'Bạn không có quyền thực hiện hành động này');
        }
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
