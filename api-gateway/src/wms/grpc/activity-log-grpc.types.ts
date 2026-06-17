import { Observable } from 'rxjs';

export interface ActivityLogGrpcClient {
  listActivityLogs(
    request: ListActivityLogsGrpcRequest,
  ): Observable<ListActivityLogsGrpcResponse>;
}

export interface ListActivityLogsGrpcRequest {
  page: number;
}

export interface ActivityLogGrpc {
  logId?: string;
  userId?: string;
  username: string;
  action: string;
  referenceType?: string;
  referenceId?: string;
  description: string;
  createdAt?: string;
}

export interface ListActivityLogsGrpcResponse {
  activityLogs?: ActivityLogGrpc[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}
