import { apiRequest } from "@/lib/api/api-client";

export type Warehouse = {
  warehouse_id: string;
  warehouse_code: string;
  warehouse_name: string;
  address: string;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type WarehousePayload = {
  warehouseCode: string;
  warehouseName: string;
  address?: string;
};

export type WarehouseLocation = {
  location_id: string;
  warehouse_id: string;
  zone: string;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type WarehouseLocationPayload = {
  warehouseId: string;
  zone?: string;
};

export async function listWarehouses() {
  const response =
    await apiRequest<{ warehouses: Warehouse[] }>("/api/warehouses");
  return response.warehouses ?? [];
}

export async function createWarehouse(payload: WarehousePayload) {
  return apiRequest<{ warehouse: Warehouse | null }>("/api/warehouses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWarehouse(
  warehouseId: string,
  payload: WarehousePayload,
) {
  return apiRequest<{ warehouse: Warehouse | null }>(
    `/api/warehouses/${warehouseId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteWarehouse(warehouseId: string) {
  return apiRequest<{ warehouse: Warehouse | null }>(
    `/api/warehouses/${warehouseId}`,
    {
      method: "DELETE",
    },
  );
}

export async function listWarehouseLocations(warehouseId?: string) {
  const query = warehouseId ? `?warehouseId=${encodeURIComponent(warehouseId)}` : "";
  const response = await apiRequest<{ locations: WarehouseLocation[] }>(
    `/api/warehouse-locations${query}`,
  );
  return response.locations ?? [];
}

export async function createWarehouseLocation(payload: WarehouseLocationPayload) {
  return apiRequest<{ location: WarehouseLocation | null }>(
    "/api/warehouse-locations",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateWarehouseLocation(
  locationId: string,
  payload: WarehouseLocationPayload,
) {
  return apiRequest<{ location: WarehouseLocation | null }>(
    `/api/warehouse-locations/${locationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteWarehouseLocation(locationId: string) {
  return apiRequest<{ location: WarehouseLocation | null }>(
    `/api/warehouse-locations/${locationId}`,
    {
      method: "DELETE",
    },
  );
}
