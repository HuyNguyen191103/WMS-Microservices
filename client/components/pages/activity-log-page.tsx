"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/format";
import {
  ActivityLog,
  listActivityLogs,
  Pagination,
} from "@/lib/api/activity-log-api";

export function ActivityLogPage() {
  return <ActivityLogContent />;
}

function ActivityLogContent() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [detailLog, setDetailLog] = useState<ActivityLog | null>(null);

  async function loadLogs(page: number) {
    setIsLoading(true);
    try {
      const response = await listActivityLogs(page);
      setLogs(response.activity_logs ?? []);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Unable to load activity logs", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs(1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const columns = useMemo<DataTableColumn<ActivityLog>[]>(
    () => [
      { key: "username", header: "Username", cell: (log) => log.username || "N/A" },
      {
        key: "action",
        header: "Action",
        cell: (log) => <Badge>{log.action || "Unknown"}</Badge>,
      },
      {
        key: "reference",
        header: "Reference Type",
        cell: (log) => log.reference_type || "N/A",
      },
      {
        key: "description",
        header: "Description",
        cell: (log) => (
          <span className="block max-w-xl truncate">{log.description || "N/A"}</span>
        ),
      },
      {
        key: "created",
        header: "Created At",
        cell: (log) => formatDateTime(log.created_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        eyebrow="Audit"
        title="ActivityLog"
        description="Review auditable actions captured by the warehouse management services."
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        getRowKey={(log) => log.log_id}
        onRowDoubleClick={setDetailLog}
        emptyMessage="No activity logs found."
      />

      <Dialog open={Boolean(detailLog)} onOpenChange={(open) => !open && setDetailLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activity log details</DialogTitle>
            <DialogDescription>
              Double-click any activity log row to inspect its full information.
            </DialogDescription>
          </DialogHeader>
          {detailLog ? (
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <DetailItem label="Username" value={detailLog.username || "N/A"} />
              <DetailItem label="Action" value={<Badge>{detailLog.action || "Unknown"}</Badge>} />
              <DetailItem label="Reference Type" value={detailLog.reference_type || "N/A"} />
              <DetailItem label="Reference ID" value={detailLog.reference_id || "N/A"} />
              <DetailItem label="User ID" value={detailLog.user_id || "N/A"} />
              <DetailItem label="Created At" value={formatDateTime(detailLog.created_at)} />
              <div className="sm:col-span-2">
                <DetailItem
                  label="Description"
                  value={detailLog.description || "No description"}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <p>
          Page {pagination.page} of {pagination.total_pages || 1} ·{" "}
          {pagination.total_items} total items
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => loadLogs(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={
              pagination.total_pages === 0 ||
              pagination.page >= pagination.total_pages ||
              isLoading
            }
            onClick={() => loadLogs(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-950">{value}</div>
    </div>
  );
}
