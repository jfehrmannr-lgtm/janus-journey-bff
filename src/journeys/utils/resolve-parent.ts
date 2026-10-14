import { BadRequestException } from '@nestjs/common'
import type { ParentReferenceDto } from '@common/parent-reference.dto.js'

type ParentInput = Record<string, unknown>

const isRecord = (value: unknown): value is ParentInput =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

export function resolveParent(parent: unknown, authenticatedUserId: string): ParentReferenceDto {
  if (authenticatedUserId.trim() === '') {
    throw new BadRequestException('Authenticated User ID is required to resolve the parent')
  }

  if (parent === undefined || parent === null) {
    return { uid: authenticatedUserId, type: 'user' }
  }

  if (!isRecord(parent)) {
    throw new BadRequestException('Parent must be an object')
  }

  const uid = parent.uid
  const type = parent.type

  if (isBlank(uid) && isBlank(type)) {
    return { uid: authenticatedUserId, type: 'user' }
  }

  if (type === 'user') {
    throw new BadRequestException('Clients must not provide a User parent')
  }

  if (isBlank(uid) || isBlank(type) || typeof uid !== 'string' || typeof type !== 'string') {
    throw new BadRequestException('Parent must include a valid non-User uid and type')
  }

  if (!['journey', 'folder'].includes(type)) {
    throw new BadRequestException('Parent type must be journey or folder')
  }

  return { uid, type: type as ParentReferenceDto['type'] }
}
