import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Allow safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Retrieve tokens
    const csrfCookie = request.cookies['csrf_token'];
    const csrfHeader = request.headers['x-csrf-token'];

    // Validate tokens
    // Validate tokens
    if (!csrfCookie || !csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    const cookieBuffer = Buffer.from(csrfCookie);
    const headerBuffer = Buffer.from(csrfHeader as string);

    // Constant-time comparison
    // 1. Check length equality
    const lengthMatch = cookieBuffer.length === headerBuffer.length;

    // 2. Create buffers of equal length for timingSafeEqual to avoid errors
    // If lengths differ, we still compare against a dummy buffer to maintain timing
    const maxLen = Math.max(cookieBuffer.length, headerBuffer.length, 1);
    const safeCookieBuffer = Buffer.alloc(maxLen, 0);
    const safeHeaderBuffer = Buffer.alloc(maxLen, 0);

    cookieBuffer.copy(safeCookieBuffer);
    headerBuffer.copy(safeHeaderBuffer);

    // 3. Perform timing-safe comparison
    const contentMatch = crypto.timingSafeEqual(safeCookieBuffer, safeHeaderBuffer);

    if (!lengthMatch || !contentMatch) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }
}
