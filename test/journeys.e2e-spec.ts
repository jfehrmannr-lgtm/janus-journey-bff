import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import request from 'supertest'
import { App } from 'supertest/types.js'
import { AppModule } from '../src/app.module.js'
import { JwtVerifierService } from '../src/auth/services/jwt-verifier.service.js'
import { setupSwagger } from '../src/config/swagger.config.js'
import { MsJourneysClient } from '../src/journeys/clients/ms-journeys.client.js'

interface SwaggerOperation {
  readonly tags?: readonly string[]
  readonly parameters?: readonly {
    readonly name?: string
    readonly in?: string
    readonly required?: boolean
    readonly schema?: {
      readonly type?: string
      readonly minimum?: number
      readonly maximum?: number
    }
  }[]
  readonly responses?: Record<
    string,
    {
      readonly content?: Record<string, { readonly schema?: { readonly $ref?: string } }>
    }
  >
  readonly requestBody?: {
    readonly content?: Record<string, { readonly schema?: { readonly $ref?: string } }>
  }
}

interface SwaggerSchema {
  readonly properties?: Record<string, Record<string, unknown>>
}

interface SwaggerDocument {
  readonly paths: Record<string, Record<string, SwaggerOperation>>
  readonly components?: { readonly schemas?: Record<string, SwaggerSchema> }
}

describe('Authenticated ms-journeys flow (e2e)', () => {
  let app: INestApplication<App>
  const verify = jest.fn()
  const createJourney = jest.fn()
  const findAllJourneys = jest.fn()
  const findJourneyByUid = jest.fn()
  const updateJourney = jest.fn()
  const removeJourney = jest.fn()
  const createFolder = jest.fn()
  const findAllFolders = jest.fn()
  const findFolderByUid = jest.fn()
  const updateFolder = jest.fn()
  const removeFolder = jest.fn()
  const createTask = jest.fn()
  const findAllTasks = jest.fn()
  const findTaskByUid = jest.fn()
  const updateTask = jest.fn()
  const removeTask = jest.fn()

  beforeEach(async () => {
    verify.mockReset().mockResolvedValue({ sub: 'subject-123' })
    const success = {
      body: {
        description: 'Description for journey',
        parent: { type: 'user', uid: 'user-1' },
        uid: 'domain-uid-1',
        type: 'journey'
      },
      headers: {},
      status: 200
    }
    const collectionSuccess = { body: { items: [], totalRecords: 0 }, headers: {}, status: 200 }

    for (const mock of [
      createJourney,
      findAllJourneys,
      findJourneyByUid,
      updateJourney,
      removeJourney,
      createFolder,
      findAllFolders,
      findFolderByUid,
      updateFolder,
      removeFolder,
      createTask,
      findAllTasks,
      findTaskByUid,
      updateTask,
      removeTask
    ]) {
      mock.mockReset().mockResolvedValue(success)
    }
    findAllJourneys.mockResolvedValue(collectionSuccess)
    findAllFolders.mockResolvedValue(collectionSuccess)
    findAllTasks.mockResolvedValue(collectionSuccess)
    createJourney.mockResolvedValue({ ...success, status: 201 })
    createFolder.mockResolvedValue({ ...success, status: 201 })
    createTask.mockResolvedValue({ ...success, status: 201 })
    removeJourney.mockResolvedValue({ body: undefined, headers: {}, status: 204 })
    removeFolder.mockResolvedValue({ body: undefined, headers: {}, status: 204 })
    removeTask.mockResolvedValue({ body: undefined, headers: {}, status: 204 })

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(JwtVerifierService)
      .useValue({ verify })
      .overrideProvider(MsJourneysClient)
      .useValue({
        createFolder,
        createJourney,
        createTask,
        findAllFolders,
        findAllJourneys,
        findAllTasks,
        findFolderByUid,
        findJourneyByUid,
        findTaskByUid,
        removeFolder,
        removeJourney,
        removeTask,
        updateFolder,
        updateJourney,
        updateTask
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true
      })
    )
    setupSwagger(app)
    await app.init()
  })

  it('requires authentication for all three resource groups', async () => {
    await request(app.getHttpServer()).get('/journeys').expect(401)
    await request(app.getHttpServer()).get('/folders').expect(401)
    await request(app.getHttpServer()).get('/tasks').expect(401)
  })

  it('requires collection pagination and reports effective page size', async () => {
    const auth = { Authorization: 'Bearer token' }

    await request(app.getHttpServer()).get('/journeys').set(auth).expect(400)
    const response = await request(app.getHttpServer()).get('/journeys?page=1&size=201').set(auth).expect(200)

    const body = response.body as { pagination: Record<string, number>; filters: Record<string, never> }
    expect(body.pagination).toMatchObject({ page: 1, size: 200, length: 0, totalRecords: 0, totalPages: 0 })
    expect(body.filters).toEqual({})
    expect(findAllJourneys).toHaveBeenCalledWith({ page: 1, size: 200 })

    for (const size of [1, 50, 200, 201, 2000, 40000]) {
      for (const resource of ['journeys', 'folders', 'tasks']) {
        await request(app.getHttpServer()).get(`/${resource}?page=1&size=${size}`).set(auth).expect(200)
      }
    }

    for (const size of ['0', '-20', '1.5', 'abc', 'Infinity']) {
      for (const resource of ['journeys', 'folders', 'tasks']) {
        await request(app.getHttpServer()).get(`/${resource}?page=1&size=${size}`).set(auth).expect(400)
      }
    }
  })

  it('delegates all resource CRUD routes using domain UIDs', async () => {
    const auth = { Authorization: 'Bearer token' }

    await request(app.getHttpServer())
      .post('/journeys')
      .set(auth)
      .send({ name: 'Journey', parent: { type: 'user', uid: 'user-1' } })
      .expect(201)
    await request(app.getHttpServer()).get('/journeys?page=1&size=20').set(auth).expect(200)
    await request(app.getHttpServer()).get('/journeys/journey-1').set(auth).expect(200)
    await request(app.getHttpServer()).put('/journeys/journey-1').set(auth).send({ name: 'Replaced' }).expect(404)
    await request(app.getHttpServer()).patch('/journeys/journey-1').set(auth).send({ name: 'Updated' }).expect(200)
    await request(app.getHttpServer()).delete('/journeys/journey-1').set(auth).expect(204)

    await request(app.getHttpServer())
      .post('/folders')
      .set(auth)
      .send({ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } })
      .expect(201)
    await request(app.getHttpServer()).get('/folders?page=1&size=20').set(auth).expect(200)
    await request(app.getHttpServer()).get('/folders/folder-1').set(auth).expect(200)
    await request(app.getHttpServer()).put('/folders/folder-1').set(auth).send({ name: 'Replaced' }).expect(404)
    await request(app.getHttpServer()).patch('/folders/folder-1').set(auth).send({ name: 'Updated' }).expect(200)
    await request(app.getHttpServer()).delete('/folders/folder-1').set(auth).expect(204)

    await request(app.getHttpServer())
      .post('/tasks')
      .set(auth)
      .send({ isVisible: true, name: 'Task', parent: { type: 'folder', uid: 'folder-1' }, state: 'pending' })
      .expect(201)
    await request(app.getHttpServer()).get('/tasks?page=1&size=20').set(auth).expect(200)
    await request(app.getHttpServer()).get('/tasks/task-1').set(auth).expect(200)
    await request(app.getHttpServer()).put('/tasks/task-1').set(auth).send({ state: 'complete' }).expect(404)
    await request(app.getHttpServer()).patch('/tasks/task-1').set(auth).send({ isVisible: false }).expect(200)
    await request(app.getHttpServer()).delete('/tasks/task-1').set(auth).expect(204)

    expect(createJourney).toHaveBeenCalledWith({ name: 'Journey', parent: { type: 'user', uid: 'user-1' } })
    expect(findJourneyByUid).toHaveBeenCalledWith('journey-1')
    expect(updateJourney).toHaveBeenCalledWith('journey-1', { name: 'Updated' })
    expect(removeJourney).toHaveBeenCalledWith('journey-1')
    expect(createFolder).toHaveBeenCalledWith({ name: 'Folder', parent: { type: 'journey', uid: 'journey-1' } })
    expect(createTask).toHaveBeenCalledWith({
      isVisible: true,
      name: 'Task',
      parent: { type: 'folder', uid: 'folder-1' },
      state: 'pending'
    })
  })

  it('validates resource-specific payloads', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', 'Bearer token')
      .send({ isVisible: true, name: 'Task', parent: { type: 'folder', uid: 'folder-1' }, state: 'invalid' })
      .expect(400)
    expect(createTask).not.toHaveBeenCalled()
  })

  it('uses the required Swagger tags and does not expose MongoDB identifiers', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200)
    const document = response.body as unknown as SwaggerDocument

    expect(document.paths['/journeys']?.post?.tags).toEqual(['MS Journeys · Journeys'])
    expect(document.paths['/folders']?.post?.tags).toEqual(['MS Journeys · Folders'])
    expect(document.paths['/tasks']?.post?.tags).toEqual(['MS Journeys · Tasks'])
    const collectionResponses = [
      ['journeys', 'JourneysCollectionResponseDto', 'JourneyResponseDto'],
      ['folders', 'FoldersCollectionResponseDto', 'FolderResponseDto'],
      ['tasks', 'TasksCollectionResponseDto', 'TaskResponseDto']
    ] as const

    for (const [resource, responseDto, itemDto] of collectionResponses) {
      const resourceName = resource.slice(0, -1)
      const createDto = `Create${resourceName[0].toUpperCase()}${resourceName.slice(1)}Dto`
      const updateDto = `Update${resourceName[0].toUpperCase()}${resourceName.slice(1)}Dto`
      const itemProperties = document.components?.schemas?.[itemDto]?.properties
      const createProperties = document.components?.schemas?.[createDto]?.properties
      const updateProperties = document.components?.schemas?.[updateDto]?.properties

      expect(document.paths[`/${resource}`]?.get?.responses?.['200']?.content?.['application/json']?.schema).toEqual({
        $ref: `#/components/schemas/${responseDto}`
      })
      expect(document.paths[`/${resource}`]?.get?.requestBody).toBeUndefined()
      expect(document.paths[`/${resource}`]?.post?.requestBody?.content?.['application/json']?.schema).toEqual({
        $ref: `#/components/schemas/${createDto}`
      })
      expect(document.paths[`/${resource}/{uid}`]?.get?.requestBody).toBeUndefined()
      expect(
        document.paths[`/${resource}/{uid}`]?.get?.responses?.['200']?.content?.['application/json']?.schema
      ).toEqual({
        $ref: `#/components/schemas/${itemDto}`
      })
      expect(document.paths[`/${resource}/{uid}`]?.patch?.requestBody?.content?.['application/json']?.schema).toEqual({
        $ref: `#/components/schemas/${updateDto}`
      })
      expect(
        document.paths[`/${resource}/{uid}`]?.patch?.responses?.['200']?.content?.['application/json']?.schema
      ).toEqual({
        $ref: `#/components/schemas/${itemDto}`
      })

      expect(createProperties?.parent).toEqual({ $ref: '#/components/schemas/ParentReferenceDto' })
      expect(updateProperties?.parent).toEqual({ $ref: '#/components/schemas/ParentReferenceDto' })
      expect(createProperties?.parentUid).toBeUndefined()
      expect(updateProperties?.parentUid).toBeUndefined()
      expect(itemProperties?.parent).toEqual({ $ref: '#/components/schemas/ParentReferenceDto' })
      expect(itemProperties?.parentUid).toBeUndefined()
      expect(itemProperties?.description).toMatchObject({
        example: `Description for ${resourceName}`,
        nullable: true,
        type: 'string'
      })

      if (resource !== 'journeys') {
        expect(createProperties?.orderIndex).toMatchObject({ example: 100, type: 'number' })
        expect(updateProperties?.orderIndex).toMatchObject({ example: 100, type: 'number' })
        expect(itemProperties?.orderIndex).toMatchObject({ example: 100, type: 'number' })
      }

      const responseProperties = document.components?.schemas?.[responseDto]?.properties
      expect(responseProperties?.payload).toMatchObject({
        type: 'array',
        items: { $ref: `#/components/schemas/${itemDto}` }
      })
      expect(responseProperties?.pagination).toEqual({
        $ref: '#/components/schemas/PaginationResponseDto'
      })
      expect(responseProperties?.filters?.type).toBe('object')
      expect(document.paths[`/${resource}/{uid}`]?.put).toBeUndefined()
      expect(document.paths[`/${resource}/{uid}`]?.patch).toBeDefined()
    }

    expect(document.components?.schemas?.ParentReferenceDto?.properties).toEqual({
      uid: expect.objectContaining({ example: 'journey-123', type: 'string' }),
      type: expect.objectContaining({ enum: ['user', 'journey', 'folder'] })
    })

    expect(document.components?.schemas?.PaginationResponseDto?.properties).toEqual({
      page: expect.objectContaining({ type: 'number', minimum: 1 }),
      size: expect.objectContaining({ type: 'number', minimum: 1 }),
      length: expect.objectContaining({ type: 'number', minimum: 0 }),
      totalRecords: expect.objectContaining({ type: 'number', minimum: 0 }),
      totalPages: expect.objectContaining({ type: 'number', minimum: 0 })
    })
    expect(document.paths['/tasks']?.get?.parameters).toEqual([
      expect.objectContaining({
        name: 'page',
        in: 'query',
        required: true,
        schema: expect.objectContaining({ type: 'integer', minimum: 1 })
      }),
      expect.objectContaining({
        name: 'size',
        in: 'query',
        required: true,
        schema: expect.objectContaining({ type: 'integer', minimum: 1 })
      })
    ])
    expect(JSON.stringify(document)).not.toContain('_id')
  })

  afterEach(async () => {
    await app.close()
  })
})
