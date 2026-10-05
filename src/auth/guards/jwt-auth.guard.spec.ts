import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { describe, expect, it, jest } from '@jest/globals'
import type { AuthenticatedRequest } from '../types/authenticated-identity.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'

const createContext = (request: AuthenticatedRequest): ExecutionContext =>
  ({
    getClass: () => class TestController {},
    getHandler: () => function testHandler() {},
    switchToHttp: () => ({ getRequest: () => request })
  }) as unknown as ExecutionContext

describe('JwtAuthGuard', () => {
  it('rejects requests without a bearer token', async () => {
    const verifier = { verify: jest.fn() }
    const guard = new JwtAuthGuard(new Reflector(), verifier)

    await expect(guard.canActivate(createContext({ headers: {} } as AuthenticatedRequest))).rejects.toMatchObject({
      status: 401
    })
    expect(verifier.verify).not.toHaveBeenCalled()
  })

  it('stores only the validated identity on the request', async () => {
    const verifier = { verify: jest.fn().mockResolvedValue({ sub: 'subject-123' }) }
    const guard = new JwtAuthGuard(new Reflector(), verifier)
    const request = {
      headers: { authorization: 'Bearer token' }
    } as AuthenticatedRequest

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true)
    expect(request.user).toEqual({ sub: 'subject-123' })
  })
})
