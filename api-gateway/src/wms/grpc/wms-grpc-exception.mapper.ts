import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';

type GrpcError = {
  code?: number;
  details?: string;
};

export type WmsGrpcExceptionOptions = {
  domain: string;
  fallbackMessage: string;
  additionalBadRequestCodes?: number[];
};

@Injectable()
export class WmsGrpcExceptionMapper {

  toHttpException(
    error: unknown,
    options: WmsGrpcExceptionOptions,
  ): HttpException {
    const grpcError = error as GrpcError;

    const message = grpcError.details || options.fallbackMessage;
    const badRequestCodes = [
      status.INVALID_ARGUMENT,
      ...(options.additionalBadRequestCodes ?? []),
    ];

    if (
      grpcError.code !== undefined &&
      badRequestCodes.includes(grpcError.code)
    ) {
      return new BadRequestException(message);
    }

    if (grpcError.code === status.NOT_FOUND) {
      return new NotFoundException(message);
    }

    if (grpcError.code === status.ALREADY_EXISTS) {
      return new ConflictException(message);
    }

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
