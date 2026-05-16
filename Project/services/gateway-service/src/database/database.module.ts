import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Tenant } from './entities/tenant.entity';
import { Department } from './entities/department.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'hospital_platform'),
        entities: [Tenant, Department, Role, User, UserRole],
        synchronize: process.env.NODE_ENV !== 'production', // Use migrations in prod
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([Tenant, Department, Role, User, UserRole]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
