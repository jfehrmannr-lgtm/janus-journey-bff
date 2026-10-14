import { BadRequestException } from '@nestjs/common'
import { describe, expect, it } from '@jest/globals'
import { resolveParent } from './resolve-parent.js'

describe('resolveParent', () => {
  it.each([undefined, null, {}, { uid: '', type: '' }, { uid: '  ', type: '  ' }])(
    'resolves an empty parent to the authenticated User: %j',
    (parent) => {
      expect(resolveParent(parent, 'user-1')).toEqual({ uid: 'user-1', type: 'user' })
    }
  )

  it('rejects an explicit User parent', () => {
    expect(() => resolveParent({ uid: 'other-user', type: 'user' }, 'user-1')).toThrow(BadRequestException)
  })

  it('preserves a complete non-User parent', () => {
    const parent = { uid: 'folder-1', type: 'folder' }
    expect(resolveParent(parent, 'user-1')).toEqual(parent)
  })

  it.each([{ uid: 'journey-1' }, { type: 'folder' }, { uid: '', type: 'journey' }, { uid: 'folder-1', type: '' }])(
    'rejects a partially specified parent: %j',
    (parent) => {
      expect(() => resolveParent(parent, 'user-1')).toThrow(BadRequestException)
    }
  )
})
