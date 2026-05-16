import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Department } from './department.entity';
import { Tenant } from './tenant.entity';

@Entity('user_roles')
@Index(['user_id', 'role_id', 'department_id'], { unique: true })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @Column({ type: 'uuid', nullable: true })
  granted_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  granted_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', default: {} })
  conditions: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
