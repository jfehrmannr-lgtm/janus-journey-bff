import { describe, expect, it } from '@jest/globals'
import { validateEnvironment } from './configuration.js'

describe('validateEnvironment', () => {
  it('normalizes valid configuration', () => {
    const config = validateEnvironment({
      PORT: '4000',
      BETTER_AUTH_ISSUER: 'https://auth.example.com',
      BETTER_AUTH_JWKS_URL: 'https://auth.example.com/jwks.json',
      MS_USERS_BASE_URL: 'http://localhost:4001',
      MS_USERS_TIMEOUT_MS: '2500',
      MS_JOURNEYS_BASE_URL: 'http://localhost:4002',
      MS_JOURNEYS_TIMEOUT_MS: '3500'
    })

    expect(config.PORT).toBe(4000)
    expect(config.MS_USERS_TIMEOUT_MS).toBe(2500)
    expect(config.MS_JOURNEYS_TIMEOUT_MS).toBe(3500)
  })

  it('rejects missing required configuration', () => {
    expect(() => validateEnvironment({})).toThrow('BETTER_AUTH_ISSUER')
  })
})
