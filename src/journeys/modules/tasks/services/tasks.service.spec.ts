import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '@journeys/clients/ms-journeys.client.js'
import { TasksService } from './tasks.service.js'

describe('TasksService', () => {
  it('delegates Task operations to the Task client methods', async () => {
    const createTask = jest.fn().mockResolvedValue({})
    const findAllTasks = jest.fn().mockResolvedValue({ status: 200, headers: {}, body: { items: [], totalRecords: 0 } })
    const findTaskByUid = jest.fn().mockResolvedValue({})
    const updateTask = jest.fn().mockResolvedValue({})
    const removeTask = jest.fn().mockResolvedValue({})
    const client = {
      createTask,
      findAllTasks,
      findTaskByUid,
      updateTask,
      removeTask
    } as unknown as MsJourneysClient
    const service = new TasksService(client)

    await service.create({
      isVisible: true,
      name: 'Task',
      parent: { type: 'folder', uid: 'folder-1' },
      state: 'pending'
    })
    await service.findAll({ page: 1, size: 20 })
    await service.findByUid('task-1')
    await service.update('task-1', { isVisible: false })
    await service.remove('task-1')

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
  })
})
