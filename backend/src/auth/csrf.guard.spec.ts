import { CsrfGuard } from './csrf.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;

  beforeEach(() => {
    guard = new CsrfGuard();
  });

  const createMockContext = (method: string, cookies: any = {}, headers: any = {}) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          cookies,
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow GET requests', () => {
    const context = createMockContext('GET');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should block POST requests without tokens', () => {
    const context = createMockContext('POST');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should block POST requests with mismatched tokens', () => {
    const context = createMockContext('POST', { csrf_token: 'token1' }, { 'x-csrf-token': 'token2' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow POST requests with matching tokens', () => {
    const context = createMockContext('POST', { csrf_token: 'valid-token' }, { 'x-csrf-token': 'valid-token' });
    expect(guard.canActivate(context)).toBe(true);
  });
});
