"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InventoryPagination,
  InventoryTransaction,
  listInventoryTransactions,
} from "@/lib/api/inventory-api";
import { formatDateTime } from "@/lib/format";

export function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [pagination, setPagination] = useState<InventoryPagination>({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  async function loadTransactions(page: number) {
    setIsLoading(true);
    try {
      const response = await listInventoryTransactions(page);
      setTransactions(response.inventory_transactions ?? []);
      setPagination(response.pagination);
    } catch (error) {
      toast.error("Unable to load inventory transactions", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransactions(1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const columns = useMemo<DataTableColumn<InventoryTransaction>[]>(
    () => [
      {
        key: "product",
        header: "Product",
        cell: (transaction) => (
          <div>
            <p className="font-medium text-slate-950">
              {transaction.product_name}
            </p>
            <p className="text-xs text-slate-500">
              {transaction.product_sku}
            </p>
          </div>
        ),
      },
      {
        key: "warehouse",
        header: "Warehouse",
        cell: (transaction) => (
          <div>
            <p>{transaction.warehouse_name}</p>
            <p className="text-xs text-slate-500">
              {transaction.warehouse_code}
            </p>
          </div>
        ),
      },
      {
        key: "location",
        header: "Location",
        cell: (transaction) => transaction.location_zone,
      },
      {
        key: "type",
        header: "Type",
        cell: (transaction) => (
          <Badge>{transaction.transaction_type}</Badge>
        ),
      },
      {
        key: "quantity",
        header: "Quantity",
        cell: (transaction) =>
          `${transaction.quantity.toLocaleString("en")} ${transaction.product_unit}`,
      },
      {
        key: "reference",
        header: "Reference",
        cell: (transaction) => transaction.reference_no,
      },
      {
        key: "createdBy",
        header: "Created By",
        cell: (transaction) => transaction.created_by,
      },
      {
        key: "createdAt",
        header: "Created At",
        cell: (transaction) => formatDateTime(transaction.created_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Inventory Transactions"
        description="Review stock movement history, references, quantities, and responsible users."
      />

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        getRowKey={(transaction) => transaction.transaction_id}
        emptyMessage="No inventory transactions found."
      />

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
            onClick={() => void loadTransactions(pagination.page - 1)}
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
            onClick={() => void loadTransactions(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
