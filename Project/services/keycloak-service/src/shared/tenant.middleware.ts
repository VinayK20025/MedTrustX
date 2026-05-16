import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    let tenantId = req.headers['x-tenant-id'] as string;
    
    // Extract from path if present (e.g. /realms/tenant_apollo/...)
    const pathParts = req.path.split('/');
    const realmIdx = pathParts.indexOf('realms');
    if (realmIdx !== -1 && pathParts.length > realmIdx + 1) {
        tenantId = pathParts[realmIdx + 1];
    }
    
    if (!tenantId) {
      tenantId = 'tenant_apollo';
    }
    req.tenantId = tenantId;
    res.setHeader('X-Tenant-ID', tenantId);
    this.logger.debug(`Tenant resolved: ${tenantId} for ${req.baseUrl}`);
    next();
  }
}
