import { SetMetadata } from '@nestjs/common';
import { Subjects } from './ability.factory';

export interface RequiredRule {
  action: string;
  subject: Subjects | string;
  message?: string;
}

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...rules: RequiredRule[]) =>
  SetMetadata(CHECK_POLICIES_KEY, rules);
