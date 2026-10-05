import type { SchemaObject } from '@nestjs/swagger'

export const userPayloadSchema: SchemaObject = {
  additionalProperties: true,
  description: 'Opaque JSON User payload forwarded to ms-users. The BFF does not define User fields at this stage.',
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

export const forwardedParamsDescription =
  'Other query parameters are forwarded to ms-users as generic request parameters. The BFF does not define the supported parameter set yet.'
