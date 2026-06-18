import { apiRequest } from "@/lib/api/api-client";

export type InventoryItem = {
  inventory_id: string;
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  location_id: string;
  location_zone: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  product_unit: string;
  quantity: number;
  updated_at: string;
};

export type InventoryTransaction = {
  transaction_id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  product_unit: string;
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  location_id: string;
  location_zone: string;
  transaction_type: string;
  quantity: number;
  reference_no: string;
  created_by: string;
  created_at: string;
};

export type InventoryPagination = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export async function listInventoryItems(warehouseId: string) {
  const response = await apiRequest<{ inventory_items: InventoryItem[] }>(
    `/api/inventory-items?warehouseId=${encodeURIComponent(warehouseId)}`,
  );

  return response.inventory_items ?? [];
}

export async function listInventoryTransactions(page: number) {
  return apiRequest<{
    inventory_transactions: InventoryTransaction[];
    pagination: InventoryPagination;
  }>(`/api/inventory-transactions?page=${page}`);
}
