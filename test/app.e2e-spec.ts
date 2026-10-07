import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { App } from 'supertest/types.js'
import { AppModule } from './../src/app.module.js'
import { JwtVerifierService } from '../src/auth/services/jwt-verifier.service.js'
import { setupSwagger } from '../src/config/swagger.config.js'
import { MsUsersClient } from '../src/users/clients/ms-users.client.js'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

interface SwaggerDocumentShape {
  readonly components: {
    readonly securitySchemes: Record<string, Record<string, string>>
  }
  readonly paths: Record<string, SwaggerPathShape>
}

interface SwaggerPathShape {
  readonly get?: SwaggerOperationShape
  readonly patch?: SwaggerOperationShape
  readonly post?: SwaggerOperationShape
  readonly delete?: SwaggerOperationShape
}

interface SwaggerOperationShape {
  readonly summary?: string
  readonly description?: string
  readonly security?: readonly Record<string, readonly string[]>[]
  readonly parameters?: readonly SwaggerParameterShape[]
  readonly requestBody?: {
    readonly content?: Record<string, { readonly schema?: Record<string, unknown> }>
  }
  readonly responses: Record<
    string,
    { readonly description?: string; readonly content?: Record<string, { readonly schema?: Record<string, unknown> }> }
  >
}

interface SwaggerParameterShape {
  readonly name: string
  readonly in: string
  readonly required?: boolean
  readonly description?: string
  readonly schema?: { readonly type?: string; readonly enum?: readonly string[]; readonly minimum?: number }
}

describe('Authenticated User flow (e2e)', () => {
  let app: INestApplication<App>
  const verify = jest.fn()
  const findById = jest.fn()
  const findAll = jest.fn()

  beforeEach(async () => {
    verify.mockReset()
    findById.mockReset()
    findAll.mockReset()

    verify.mockResolvedValue({ sub: 'subject-123' })
    findById.mockResolvedValue({ body: { userId: 'user-123' }, headers: {}, status: 200 })
    findAll.mockResolvedValue({ body: { items: [{ userId: 'user-123' }], totalRecords: 1 }, headers: {}, status: 200 })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(JwtVerifierService)
      .useValue({ verify })
      .overrideProvider(MsUsersClient)
      .useValue({ findAll, findById })
      .compile()

    app = moduleFixture.createNestApplication()
    setupSwagger(app)
    await app.init()
  })

  it('rejects requests without authentication', async () => {
    await request(app.getHttpServer()).get('/users/user-123').expect(401)
    expect(findById).not.toHaveBeenCalled()
  })

  it('propagates the validated identity and downstream response', async () => {
    await request(app.getHttpServer())
      .get('/users/user-123')
      .set('Authorization', 'Bearer token')
      .expect(200)
      .expect({ userId: 'user-123' })

    expect(verify).toHaveBeenCalledWith('token')
    expect(findById).toHaveBeenCalledWith('user-123', { sub: 'subject-123' })
  })

  it('forwards normal collection query params to ms-users', async () => {
    await request(app.getHttpServer()).get('/users?page=2&size=20').set('Authorization', 'Bearer token').expect(200)

    expect(findAll).toHaveBeenCalledWith({ sub: 'subject-123' }, expect.objectContaining({ page: 2, size: 20 }))
  })

  it('preserves downstream status codes', async () => {
    findById.mockResolvedValueOnce({ body: { message: 'not found' }, headers: {}, status: 404 })

    await request(app.getHttpServer())
      .get('/users/missing')
      .set('Authorization', 'Bearer token')
      .expect(404)
      .expect({ message: 'not found' })
  })

  it('publishes the bearer security scheme for authenticated operations', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200)
    const swaggerUi = await request(app.getHttpServer()).get('/docs').expect(200)
    const document = response.body as unknown as SwaggerDocumentShape

    expect(swaggerUi.text).toContain('swagger-ui')
    expect(document.components.securitySchemes.bearer).toMatchObject({
      bearerFormat: 'JWT',
      scheme: 'bearer',
      type: 'http'
    })

    const getById = document.paths['/users/{id}']?.get
    const create = document.paths['/users']?.post

    expect(getById?.security).toEqual([{ bearer: [] }])
    expect(getById?.summary).toBe('Get a User resource by ID')
    expect(getById?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: 'Identifier of the User resource to retrieve.',
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' }
        })
      ])
    )
    expect(getById?.parameters).toHaveLength(1)
    const collection = document.paths['/users']?.get
    expect(collection?.parameters).toHaveLength(8)
    expect(collection?.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ in: 'query', name: 'page', required: true, schema: { minimum: 1, type: 'number' } }),
        expect.objectContaining({ in: 'query', name: 'size', required: true, schema: { minimum: 1, type: 'number' } }),
        expect.objectContaining({ in: 'query', name: 'email', required: false }),
        expect.objectContaining({ in: 'query', name: 'isVerified', required: false }),
        expect.objectContaining({ in: 'query', name: 'username', required: false }),
        expect.objectContaining({ in: 'query', name: 'userId', required: false }),
        expect.objectContaining({
          in: 'query',
          name: 'sortBy',
          required: false,
          schema: expect.objectContaining({ enum: ['createdAt', 'updatedAt', 'userId', 'email'] })
        }),
        expect.objectContaining({
          in: 'query',
          name: 'sortOrder',
          required: false,
          schema: expect.objectContaining({ enum: ['asc', 'desc'] })
        })
      ])
    )
    expect(collection?.description).not.toContain('forwarded')
    expect(collection?.responses['200']?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/UsersCollectionResponseDto'
    })
    expect(document.paths['/users/{id}']?.patch?.parameters).toHaveLength(1)
    expect(document.paths['/users/{id}']?.delete?.parameters).toHaveLength(1)
    expect(create?.parameters).toHaveLength(0)
    expect(document.paths['/users/{id}']?.patch?.requestBody).toBeDefined()
    expect(document.paths['/users/{id}']?.get?.requestBody).toBeUndefined()
    expect(document.paths['/users/{id}']?.delete?.requestBody).toBeUndefined()
    expect(getById?.responses['200']?.description).toBe('The requested User resource was returned by ms-users.')
    expect(getById?.responses['404']?.description).toBe('The User resource was not found by ms-users.')
    expect(getById?.responses['502']?.description).toBe('The BFF could not obtain a valid response from ms-users.')
    expect(create?.requestBody?.content?.['application/json']?.schema).toEqual({
      $ref: '#/components/schemas/CreateUserDto'
    })
    expect(create?.responses['201']?.description).toBe('User resource created by ms-users.')
    expect(create?.responses['200']).toBeUndefined()
  })

  afterEach(async () => {
    if (app) {
      await app.close()
    }
  })
})
