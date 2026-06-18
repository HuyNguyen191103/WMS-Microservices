import { apiRequest } from "@/lib/api/api-client";

export type Product = {
  product_id: string;
  sku: string;
  product_name: string;
  description: string;
  category: string;
  unit: string;
  status: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type ProductPayload = {
  sku: string;
  productName: string;
  description?: string;
  category?: string;
  unit?: string;
};

export async function listProducts() {
  const response = await apiRequest<{ products: Product[] }>("/api/products");
  return response.products ?? [];
}

export async function createProduct(payload: ProductPayload) {
  return apiRequest<{ product: Product | null }>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(productId: string, payload: ProductPayload) {
  return apiRequest<{ product: Product | null }>(`/api/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: string) {
  return apiRequest<{ product: Product | null }>(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

export async function restoreProduct(productId: string) {
  return apiRequest<{ product: Product | null }>(
    `/api/products/${productId}/restore`,
    {
      method: "PATCH",
    },
  );
}
