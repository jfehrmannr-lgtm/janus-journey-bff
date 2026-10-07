import { describe, expect, it, jest } from '@jest/globals'
import { MsJourneysClient } from '../../../clients/ms-journeys.client.js'
import { TasksService } from './tasks.service.js'

describe('TasksService', () => {
  it('delegates Task operations to the Task client methods', async () => {
    const createTask = jest.fn().mockResolvedValue({})
    const findAllTasks = jest.fn().mockResolvedValue({})
    const findTaskByUid = jest.fn().mockResolvedValue({})
    const replaceTask = jest.fn().mockResolvedValue({})
    const updateTask = jest.fn().mockResolvedValue({})
    const removeTask = jest.fn().mockResolvedValue({})
    const client = {
      createTask,
      findAllTasks,
      findTaskByUid,
      replaceTask,
      updateTask,
      removeTask
    } as unknown as MsJourneysClient
    const service = new TasksService(client)

    await service.create({ isVisible: true, name: 'Task', parentUid: 'folder-1', state: 'pending' })
    await service.findAll()
    await service.findByUid('task-1')
    await service.replace('task-1', { state: 'complete' })
    await service.update('task-1', { isVisible: false })
    await service.remove('task-1')

    expect(createTask).toHaveBeenCalledWith({ isVisible: true, name: 'Task', parentUid: 'folder-1', state: 'pending' })
    expect(findAllTasks).toHaveBeenCalled()
    expect(findTaskByUid).toHaveBeenCalledWith('task-1')
    expect(replaceTask).toHaveBeenCalledWith('task-1', { state: 'complete' })
    expect(updateTask).toHaveBeenCalledWith('task-1', { isVisible: false })
    expect(removeTask).toHaveBeenCalledWith('task-1')
  })
})
