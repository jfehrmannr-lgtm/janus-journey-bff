import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import { TasksService } from './tasks.service.js'
import { BadRequestException } from '@nestjs/common'

describe('TasksService', () => {
  it('delegates Task operations to the Task client methods', async () => {
    const createTask = jest.fn().mockResolvedValue({})
    const findAllTasks = jest.fn().mockResolvedValue({ status: 200, headers: {}, body: { items: [], totalRecords: 0 } })
    const findTaskByUid = jest.fn().mockResolvedValue({})
    const updateTask = jest.fn().mockResolvedValue({})
    const removeTask = jest.fn().mockResolvedValue({})
    const removeTasksBulk = jest.fn().mockResolvedValue({})
    const client = {
      createTask,
      findAllTasks,
      findTaskByUid,
      updateTask,
      removeTask,
      removeTasksBulk
    } as unknown as MsJourneysClient
    const service = new TasksService(client)

    await service.create(
      {
        isVisible: true,
        name: 'Task',
        parent: { type: 'folder', uid: 'folder-1' },
        state: 'pending'
      },
      { sub: 'user-1' }
    )
    await service.findAll({ page: 1, size: 20 })
    await service.findByUid('task-1')
    await service.update('task-1', { isVisible: false })
    await service.remove('task-1')
    await service.deleteBulk(['task-1', 'task-2'])

    expect(createTask).toHaveBeenCalledWith({
      isVisible: true,
      name: 'Task',
      parent: { type: 'folder', uid: 'folder-1' },
      state: 'pending'
    })
    expect(findAllTasks).toHaveBeenCalledWith({ page: 1, size: 20 })
    expect(findTaskByUid).toHaveBeenCalledWith('task-1')
    expect(updateTask).toHaveBeenCalledWith('task-1', { isVisible: false })
    expect(removeTask).toHaveBeenCalledWith('task-1')
    expect(removeTasksBulk).toHaveBeenCalledWith(['task-1', 'task-2'])
  })

  it('resolves omitted parents to the authenticated User and preserves resource parents', async () => {
    const createTasksBulk = jest.fn().mockResolvedValue({})
    const service = new TasksService({ createTasksBulk } as unknown as MsJourneysClient)

    await service.createBulk(
      [
        { isVisible: true, name: 'Owned Task', state: 'pending' },
        { isVisible: true, name: 'Folder Task', parent: { type: 'folder', uid: 'folder-1' }, state: 'pending' }
      ],
      { sub: 'user-1' }
    )

    expect(createTasksBulk).toHaveBeenCalledWith([
      { isVisible: true, name: 'Owned Task', state: 'pending', parent: { type: 'user', uid: 'user-1' } },
      { isVisible: true, name: 'Folder Task', parent: { type: 'folder', uid: 'folder-1' }, state: 'pending' }
    ])
  })

  it('rejects explicit User parents before calling ms-journeys', async () => {
    const createTasksBulk = jest.fn()
    const service = new TasksService({ createTasksBulk } as unknown as MsJourneysClient)

    await expect(
      service.createBulk(
        [{ isVisible: true, name: 'Invalid', parent: { type: 'user', uid: 'other-user' }, state: 'pending' }],
        { sub: 'user-1' }
      )
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(createTasksBulk).not.toHaveBeenCalled()
  })
})
