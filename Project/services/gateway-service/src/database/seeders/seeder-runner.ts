import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tenant } from '../entities/tenant.entity';
import { Department } from '../entities/department.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';

import { TENANTS_SEED } from './data/tenants.seed';
import { DEPARTMENTS_SEED } from './data/departments.seed';
import { ROLES_SEED } from './data/roles.seed';
import { USERS_SEED } from './data/users.seed';

@Injectable()
export class SeederRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederRunner.name);

  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database seed status...');
    await this.runSeeders();
  }

  private async runSeeders() {
    // 1. Seed Tenants
    const tenantCount = await this.tenantRepo.count();
    let primaryTenant: Tenant;
    if (tenantCount === 0) {
      this.logger.log('Seeding Tenants...');
      const savedTenants = await this.tenantRepo.save(TENANTS_SEED);
      primaryTenant = savedTenants.find(t => t.slug === 'medtrust-general');
    } else {
      primaryTenant = await this.tenantRepo.findOne({ where: { slug: 'medtrust-general' } });
    }

    if (!primaryTenant) return;

    // 2. Seed Departments
    const deptCount = await this.deptRepo.count();
    if (deptCount === 0) {
      this.logger.log('Seeding Departments...');
      const depts = DEPARTMENTS_SEED.map(d => ({ ...d, tenant: primaryTenant }));
      await this.deptRepo.save(depts);
    }

    // 3. Seed Roles
    const roleCount = await this.roleRepo.count();
    if (roleCount === 0) {
      this.logger.log('Seeding Roles...');
      const roles = ROLES_SEED.map(r => ({ ...r, tenant: primaryTenant }));
      await this.roleRepo.save(roles);
    }

    // 4. Seed Users and UserRoles
    const userCount = await this.userRepo.count();
    if (userCount === 0) {
      this.logger.log('Seeding Users & UserRoles...');
      
      const departments = await this.deptRepo.find({ where: { tenant_id: primaryTenant.id } });
      const roles = await this.roleRepo.find({ where: { tenant_id: primaryTenant.id } });

      for (const u of USERS_SEED) {
        const newUser = await this.userRepo.save({
          keycloak_id: u.keycloak_id,
          employee_id: u.employee_id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          tenant: primaryTenant,
        });

        const role = roles.find(r => r.slug === u.role_slug);
        const dept = departments.find(d => d.code === u.department_code);

        if (role) {
          await this.userRoleRepo.save({
            user: newUser,
            role: role,
            department: dept,
            tenant: primaryTenant,
          });
        }
      }
      this.logger.log('Seeding complete! 🚀');
    }
  }
}
