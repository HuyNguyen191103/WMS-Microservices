import { Controller } from '@nestjs/common';
import {
  CompleteInboundRequest as CompleteInboundGrpcRequest,
  CreateInboundRequest as CreateInboundGrpcRequest,
  DeleteInboundRequest as DeleteInboundGrpcRequest,
  GetInboundRequest as GetInboundGrpcRequest,
  InboundApiController,
  InboundApiControllerMethods,
  ListInboundsRequest as ListInboundsGrpcRequest,
  UpdateInboundRequest as UpdateInboundGrpcRequest,
} from '../../generated/wms';
import { InboundService } from './inbound.service';

@Controller()
@InboundApiControllerMethods()
export class InboundGrpcController implements InboundApiController {
  constructor(private readonly inboundService: InboundService) {}

  createInbound(request: CreateInboundGrpcRequest) {
    return this.inboundService.createInbound(request);
  }

  listInbounds(_request: ListInboundsGrpcRequest) {
    void _request;
    return this.inboundService.listInbounds();
  }

  getInbound(request: GetInboundGrpcRequest) {
    return this.inboundService.getInbound(request);
  }

  updateInbound(request: UpdateInboundGrpcRequest) {
    return this.inboundService.updateInbound(request);
  }

  completeInbound(request: CompleteInboundGrpcRequest) {
    return this.inboundService.completeInbound(request);
  }

  deleteInbound(request: DeleteInboundGrpcRequest) {
    return this.inboundService.deleteInbound(request);
  }
}
