export interface ListActivityLogsGrpcRequest {
  page?: number;
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
