import { apiRequest } from "@/lib/api/api-client";

export type ActivityLog = {
  log_id: string;
  user_id: string;
  username: string;
  action: string;
  reference_type: string;
  reference_id: string;
  description: string;
  created_at: string;
};

export type Pagination = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export async function listActivityLogs(page: number) {
  return apiRequest<{
    activity_logs: ActivityLog[];
    pagination: Pagination;
  }>(`/api/activity-logs?page=${page}`);
}
