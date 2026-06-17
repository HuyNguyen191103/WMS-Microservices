import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CompleteInboundGrpcRequest,
  CreateInboundGrpcRequest,
  DeleteInboundGrpcRequest,
  GetInboundGrpcRequest,
  ListInboundsGrpcRequest,
  UpdateInboundGrpcRequest,
} from './grpc/inbound-grpc.types';
import { InboundService } from './inbound.service';

@Controller()
export class InboundGrpcController {
  constructor(private readonly inboundService: InboundService) {}

  @GrpcMethod('InboundApi', 'CreateInbound')
  createInbound(request: CreateInboundGrpcRequest) {
    return this.inboundService.createInbound(request);
  }

  @GrpcMethod('InboundApi', 'ListInbounds')
  listInbounds(_request: ListInboundsGrpcRequest) {
    return this.inboundService.listInbounds();
  }

  @GrpcMethod('InboundApi', 'GetInbound')
  getInbound(request: GetInboundGrpcRequest) {
    return this.inboundService.getInbound(request);
  }

  @GrpcMethod('InboundApi', 'UpdateInbound')
  updateInbound(request: UpdateInboundGrpcRequest) {
    return this.inboundService.updateInbound(request);
  }

  @GrpcMethod('InboundApi', 'CompleteInbound')
  completeInbound(request: CompleteInboundGrpcRequest) {
    return this.inboundService.completeInbound(request);
  }

  @GrpcMethod('InboundApi', 'DeleteInbound')
  deleteInbound(request: DeleteInboundGrpcRequest) {
    return this.inboundService.deleteInbound(request);
  }
}
