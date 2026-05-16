import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Tenant } from '../entities/tenant.entity';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

import { SeederRunner } from './seeder-runner';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, Department, Role, User, UserRole]),
  ],
  providers: [SeederRunner],
})
export class SeederModule {}
