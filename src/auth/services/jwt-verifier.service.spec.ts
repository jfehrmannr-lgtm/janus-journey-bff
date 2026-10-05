import { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const createRemoteJWKSetMock = jest.fn(() => 'remote-jwks')
const jwtVerifyMock = jest.fn()

jest.unstable_mockModule('jose', () => ({
  createRemoteJWKSet: createRemoteJWKSetMock,
  jwtVerify: jwtVerifyMock
}))

const { JwtVerifierService } = await import('./jwt-verifier.service.js')

describe('JwtVerifierService', () => {
  const config = {
    getOrThrow: (key: string) =>
      ({
        BETTER_AUTH_ISSUER: 'https://auth.example.com',
        BETTER_AUTH_JWKS_URL: 'https://auth.example.com/.well-known/jwks.json'
      })[key]
  } as unknown as ConfigService

  beforeEach(() => {
    jwtVerifyMock.mockReset()
    createRemoteJWKSetMock.mockClear()
  })

  it('validates the required JWT claims and returns only sub', async () => {
    jwtVerifyMock.mockResolvedValue({ payload: { aud: 'janus-bff', sub: 'subject-1' } })
    const verifier = new JwtVerifierService(config)

    await expect(verifier.verify('token')).resolves.toEqual({ sub: 'subject-1' })
    expect(jwtVerifyMock).toHaveBeenCalledWith(
      'token',
      'remote-jwks',
      expect.objectContaining({
        audience: 'janus-bff',
        issuer: 'https://auth.example.com',
        requiredClaims: ['exp', 'iss', 'aud', 'sub']
      })
    )
  })

  it('rejects an empty subject', async () => {
    jwtVerifyMock.mockResolvedValue({ payload: { sub: ' ' } })
    const verifier = new JwtVerifierService(config)

    await expect(verifier.verify('token')).rejects.toMatchObject({ status: 401 })
  })
})
