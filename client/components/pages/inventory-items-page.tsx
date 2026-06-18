"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import {
  InventoryItem,
  listInventoryItems,
} from "@/lib/api/inventory-api";
import { listWarehouses, Warehouse } from "@/lib/api/warehouse-api";
import { formatDateTime } from "@/lib/format";

export function InventoryItemsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    async function loadWarehouses() {
      try {
        setWarehouses(await listWarehouses());
      } catch (error) {
        toast.error("Unable to load warehouses", {
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        setIsLoadingWarehouses(false);
      }
    }

    void loadWarehouses();
  }, []);

  useEffect(() => {
    if (!selectedWarehouseId) {
      return;
    }

    let isCurrentRequest = true;

    async function loadItems() {
      setIsLoadingItems(true);
      try {
        const inventoryItems = await listInventoryItems(selectedWarehouseId);
        if (isCurrentRequest) {
          setItems(inventoryItems);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setItems([]);
          toast.error("Unable to load inventory items", {
            description:
              error instanceof Error ? error.message : "Please try again.",
          });
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingItems(false);
        }
      }
    }

    void loadItems();

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedWarehouseId]);

  const columns = useMemo<DataTableColumn<InventoryItem>[]>(
    () => [
      {
        key: "product",
        header: "Product",
        cell: (item) => (
          <div>
            <p className="font-medium text-slate-950">{item.product_name}</p>
            <p className="text-xs text-slate-500">{item.product_sku}</p>
          </div>
        ),
      },
      {
        key: "location",
        header: "Location",
        cell: (item) => item.location_zone,
      },
      {
        key: "quantity",
        header: "Quantity",
        cell: (item) => item.quantity.toLocaleString("en"),
      },
      {
        key: "unit",
        header: "Unit",
        cell: (item) => item.product_unit,
      },
      {
        key: "updatedAt",
        header: "Updated At",
        cell: (item) => formatDateTime(item.updated_at),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Inventory Items"
        description="Select a warehouse to review its current stock by product and location."
        action={
          <label className="block min-w-64 text-sm font-medium text-slate-700">
            Warehouse
            <select
              value={selectedWarehouseId}
              disabled={isLoadingWarehouses}
              onChange={(event) => {
                setItems([]);
                setSelectedWarehouseId(event.target.value);
              }}
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {isLoadingWarehouses
                  ? "Loading warehouses..."
                  : "Select a warehouse"}
              </option>
              {warehouses.map((warehouse) => (
                <option
                  key={warehouse.warehouse_id}
                  value={warehouse.warehouse_id}
                >
                  {warehouse.warehouse_code} - {warehouse.warehouse_name}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoadingItems}
        getRowKey={(item) => item.inventory_id}
        emptyMessage={
          selectedWarehouseId
            ? "No inventory items found for this warehouse."
            : "Select a warehouse to view inventory items."
        }
      />
    </>
  );
}
