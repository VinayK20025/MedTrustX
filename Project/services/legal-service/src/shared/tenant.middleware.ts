import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include tenantId
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
    // Extract tenant_id from header (set by gateway)
    let tenantId = req.headers['x-tenant-id'] as string;

    // Fallback to JWT claims or default for dev
    if (!tenantId) {
       tenantId = 'tenant_apollo'; // Default for development
    }

    req.tenantId = tenantId;
    res.setHeader('X-Tenant-ID', tenantId);
    
    this.logger.debug(`Tenant resolved: ${tenantId} for path ${req.baseUrl}`);
    
    next();
  }
}
