"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { canCreateProduct, canWriteProduct } from "@/lib/permissions";
import {
  createProduct,
  deleteProduct,
  listProducts,
  Product,
  ProductPayload,
  updateProduct,
} from "@/lib/api/product-api";

const emptyForm = {
  sku: "",
  productName: "",
  description: "",
  category: "",
  unit: "",
};

const unitOptions = ["PCS", "BOX", "KG", "G", "M", "CM"];

export function ProductPage() {
  return (
    <AppShell>
      {({ user }) => (
        <ProductContent
          canCreate={canCreateProduct(user)}
          canWrite={canWriteProduct(user)}
        />
      )}
    </AppShell>
  );
}

function ProductContent({
  canCreate,
  canWrite,
}: {
  canCreate: boolean;
  canWrite: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldError, setFieldError] = useState("");

  async function loadProducts() {
    setIsLoading(true);
    try {
      setProducts(await listProducts());
    } catch (error) {
      toast.error("Unable to load products", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function openCreateForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFieldError("");
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      sku: product.sku,
      productName: product.product_name,
      description: product.description ?? "",
      category: product.category ?? "",
      unit: product.unit ?? "",
    });
    setFieldError("");
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.sku.trim() || !form.productName.trim()) {
      setFieldError("SKU and product name are required.");
      return;
    }

    const payload: ProductPayload = {
      sku: form.sku.trim(),
      productName: form.productName.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.product_id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      setFormOpen(false);
      await loadProducts();
    } catch (error) {
      toast.error("Product action failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingProduct) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteProduct(deletingProduct.product_id);
      toast.success("Product deleted");
      setDeletingProduct(null);
      await loadProducts();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = useMemo<DataTableColumn<Product>[]>(
    () => [
      { key: "sku", header: "SKU", cell: (product) => product.sku },
      {
        key: "name",
        header: "Product Name",
        cell: (product) => (
          <div>
            <p className="font-medium text-slate-950">{product.product_name}</p>
            <p className="max-w-xs truncate text-xs text-slate-500">
              {product.description || "No description"}
            </p>
          </div>
        ),
      },
      { key: "category", header: "Category", cell: (product) => product.category || "N/A" },
      { key: "unit", header: "Unit", cell: (product) => product.unit || "N/A" },
      {
        key: "status",
        header: "Status",
        cell: (product) => <StatusBadge status={product.status} />,
      },
      {
        key: "createdBy",
        header: "Created By",
        cell: (product) => product.created_by || "N/A",
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        cell: (product) =>
          canWrite ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditForm(product)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(product)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Read only</span>
          ),
      },
    ],
    [canWrite],
  );

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Product"
        description="Manage product master data used across warehouse operations."
        action={
          canCreate ? (
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        getRowKey={(product) => product.product_id}
        onRowDoubleClick={setDetailProduct}
        emptyMessage="No products have been created yet."
      />

      <Dialog open={Boolean(detailProduct)} onOpenChange={(open) => !open && setDetailProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailProduct?.product_name ?? "Product details"}</DialogTitle>
            <DialogDescription>
              Double-click any product row to inspect its full information.
            </DialogDescription>
          </DialogHeader>
          {detailProduct ? (
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <DetailItem label="SKU" value={detailProduct.sku} />
              <DetailItem label="Status" value={<StatusBadge status={detailProduct.status} />} />
              <DetailItem label="Category" value={detailProduct.category || "N/A"} />
              <DetailItem label="Unit" value={detailProduct.unit || "N/A"} />
              <DetailItem label="Created By" value={detailProduct.created_by || "N/A"} />
              <DetailItem label="Updated By" value={detailProduct.updated_by || "N/A"} />
              <div className="sm:col-span-2">
                <DetailItem
                  label="Description"
                  value={detailProduct.description || "No description"}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailProduct(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit product" : "Create product"}</DialogTitle>
            <DialogDescription>
              Keep product details consistent for all warehouse workflows.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(event) => setForm({ ...form, sku: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={form.productName}
                  onChange={(event) =>
                    setForm({ ...form, productName: event.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={form.unit}
                  onChange={(event) => setForm({ ...form, unit: event.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete product"
        description={`Delete ${deletingProduct?.product_name ?? "this product"}? This action cannot be undone.`}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleDelete}
      />
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
