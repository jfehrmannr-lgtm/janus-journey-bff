export const JWT_AUDIENCE = 'janus-bff'

const requiredString = (config: Record<string, unknown>, key: string): string => {
  const value = config[key]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value.trim()
}

const requiredUrl = (config: Record<string, unknown>, key: string): string => {
  const value = requiredString(config, key)

  try {
    const url = new URL(value)

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Unsupported URL protocol')
    }
  } catch {
    throw new Error(`Invalid URL environment variable: ${key}`)
  }

  return value
}

const positiveInteger = (config: Record<string, unknown>, key: string, fallback?: number): number => {
  const rawValue = config[key] ?? fallback
  const value = typeof rawValue === 'number' ? rawValue : Number(rawValue)

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid positive integer environment variable: ${key}`)
  }

  return value
}

export const validateEnvironment = (config: Record<string, unknown>): Record<string, unknown> => ({
  ...config,
  PORT: positiveInteger(config, 'PORT', 5000),
  BETTER_AUTH_ISSUER: requiredUrl(config, 'BETTER_AUTH_ISSUER'),
  BETTER_AUTH_JWKS_URL: requiredUrl(config, 'BETTER_AUTH_JWKS_URL'),
  MS_USERS_BASE_URL: requiredUrl(config, 'MS_USERS_BASE_URL'),
  MS_USERS_TIMEOUT_MS: positiveInteger(config, 'MS_USERS_TIMEOUT_MS', 5000)
})
