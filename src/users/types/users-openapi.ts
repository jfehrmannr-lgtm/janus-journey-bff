import type { SchemaObject } from '@nestjs/swagger'

export const userPayloadSchema: SchemaObject = {
  additionalProperties: false,
  description:
    'User update data. Only the editable configuration fields username and avatarUrl are supported under config.',
  properties: {
    config: {
      additionalProperties: false,
      properties: {
        avatarUrl: { format: 'uri', nullable: true, type: 'string' },
        username: { maxLength: 100, minLength: 1, type: 'string' }
      },
      type: 'object'
    }
  },
  type: 'object'
}

export const userResponseSchema: SchemaObject = {
  description:
    'JSON response returned by ms-users. The BFF preserves the downstream body and does not define User fields at this stage.',
  nullable: true,
  oneOf: [
    { additionalProperties: true, type: 'object' },
    { items: {}, type: 'array' },
    { type: 'string' },
    { type: 'number' },
    { type: 'boolean' }
  ]
}
