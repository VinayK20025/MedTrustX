import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';

@Entity('users')
@Index(['tenant_id', 'email'], { unique: true })
export class User extends BaseEntity {
  @Column({ length: 255, unique: true })
  keycloak_id: string;

  @Column({ length: 100, nullable: true })
  employee_id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  // TypeORM doesn't natively support GENERATED ALWAYS AS easily in standard Column decorator without raw SQL,
  // but we can specify it via standard raw SQL generation if needed or handle it dynamically.
  // For now, we will handle it via afterLoad or just let the DB handle it if mapped properly.
  @Column({ type: 'varchar', length: 255, insert: false, update: false, select: false, nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ default: false })
  mfa_enabled: boolean;

  @Column({ length: 50, nullable: true })
  mfa_method: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date;

  @Column({ type: 'inet', nullable: true })
  last_login_ip: string;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until: Date;

  @Column({ type: 'timestamptz', nullable: true })
  password_changed_at: Date;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
