import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { WNS_WMS_V1_PACKAGE_NAME } from './generated/wms';

async function bootstrap() {
  const grpcPort = process.env.GRPC_PORT ?? '5002';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: WNS_WMS_V1_PACKAGE_NAME,
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
void bootstrap();
