import { apiRequest } from "@/lib/api/api-client";

export type InboundItem = {
  inboundItemId: string;
  inboundOrderId: string;
  productId: string;
  locationId: string;
  actualQty: number;
};

export type Inbound = {
  inboundOrderId: string;
  inboundNo: string;
  warehouseId: string;
  supplierName: string;
  actualDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: InboundItem[];
};

export type InboundItemPayload = {
  productId: string;
  locationId: string;
  actualQty: number;
};

export type InboundPayload = {
  inboundNo: string;
  warehouseId: string;
  supplierName?: string;
  actualDate?: string;
  items: InboundItemPayload[];
};

export async function listInbounds() {
  const response = await apiRequest<{ inbounds: Inbound[] }>("/api/inbounds");
  return response.inbounds ?? [];
}

export async function createInbound(payload: InboundPayload) {
  return apiRequest<{ inbound: Inbound | null }>("/api/inbounds", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateInbound(
  inboundOrderId: string,
  payload: InboundPayload,
) {
  return apiRequest<{ inbound: Inbound | null }>(
    `/api/inbounds/${inboundOrderId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function completeInbound(inboundOrderId: string) {
  return apiRequest<{ inbound: Inbound | null }>(
    `/api/inbounds/${inboundOrderId}/done`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteInbound(inboundOrderId: string) {
  return apiRequest<{ inbound: Inbound | null }>(
    `/api/inbounds/${inboundOrderId}`,
    {
      method: "DELETE",
    },
  );
}
