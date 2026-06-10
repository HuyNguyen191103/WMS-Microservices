import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const grpcPort = process.env.GRPC_PORT ?? '5002';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'wns.wms.v1',
        protoPath: join(process.cwd(), '..', 'proto', 'wms.proto'),
        url: `0.0.0.0:${grpcPort}`,
        loader: {
          longs: String,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
