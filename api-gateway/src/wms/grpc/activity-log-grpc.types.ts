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
  log_id?: string;
  userId?: string;
  user_id?: string;
  username: string;
  action: string;
  referenceType?: string;
  reference_type?: string;
  referenceId?: string;
  reference_id?: string;
  description: string;
  createdAt?: string;
  created_at?: string;
}

export interface ListActivityLogsGrpcResponse {
  activityLogs?: ActivityLogGrpc[];
  activity_logs?: ActivityLogGrpc[];
  page?: number;
  pageSize?: number;
  page_size?: number;
  totalItems?: number;
  total_items?: number;
  totalPages?: number;
  total_pages?: number;
}
