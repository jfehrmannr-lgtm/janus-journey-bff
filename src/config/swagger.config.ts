import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Janus Journey BFF')
    .setDescription(
      'Authenticated Janus Journey Backend for Frontend API. User operations delegate to ms-users and preserve downstream response status and body when a valid service response is obtained.'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http'
      },
      'bearer'
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document)
}
