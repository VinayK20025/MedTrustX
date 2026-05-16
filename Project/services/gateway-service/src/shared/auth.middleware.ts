import { Injectable, NestMiddleware, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  private readonly jwtSecret = process.env.JWT_SECRET || 'medtrust-dev-jwt-secret-change-in-production-2026';

  use(req: Request, res: Response, next: NextFunction) {
    const publicPaths = ['/api/v1/iam/auth', '/health', '/metrics', '/ready'];
    
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn(`No Bearer token found for path ${req.path}`);
      throw new UnauthorizedException('Authentication required');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Centralized JWT Verification
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Inject verified context into request and headers for downstream microservices
      req['user'] = decoded;
      req.headers['x-user-id'] = decoded.sub;
      
      // Pass the most privileged role or join them
      if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
        req.headers['x-user-role'] = decoded.roles[0];
      }
      
      if (decoded.tenant_id) {
        req.headers['x-tenant-id'] = decoded.tenant_id;
        req['tenantId'] = decoded.tenant_id;
      }

      this.logger.debug(`AuthN successful for user ${decoded.sub}`);
      next();
    } catch (err: any) {
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
