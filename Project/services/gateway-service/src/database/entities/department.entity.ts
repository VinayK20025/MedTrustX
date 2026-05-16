import { Entity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';

@Entity('departments')
@Index(['tenant_id', 'code'], { unique: true })
export class Department extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  parent_department_id: string;

  @Column({ type: 'uuid', nullable: true })
  head_user_id: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'int', default: 0 })
  bed_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
