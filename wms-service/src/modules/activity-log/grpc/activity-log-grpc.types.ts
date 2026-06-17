export interface ListActivityLogsGrpcRequest {
  page?: number;
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
