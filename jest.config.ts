import type { Config } from 'jest'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@auth/(.*)\\.js$': '<rootDir>/src/auth/$1',
    '^@common/(.*)\\.js$': '<rootDir>/src/common/$1',
    '^@config/(.*)\\.js$': '<rootDir>/src/config/$1',
    '^@journeys/(.*)\\.js$': '<rootDir>/src/journeys/$1',
    '^@users/(.*)\\.js$': '<rootDir>/src/users/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node'
}

export default config
