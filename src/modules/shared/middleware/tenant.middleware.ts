import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';


@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId || tenantId.trim() === '') {
      throw new BadRequestException('Missing or invalid X-Tenant-Id header');
    }

    (req as any).tenantId = tenantId;
    next();
  }
}
