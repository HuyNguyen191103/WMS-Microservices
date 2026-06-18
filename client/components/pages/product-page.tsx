"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CrudFormDialog } from "@/components/crud-form-dialog";
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
import { useAsyncAction } from "@/hooks/use-async-action";
import { canCreateProduct, canWriteProduct } from "@/lib/permissions";
import { showRequestError } from "@/lib/request-error";
import {
  createProduct,
  deleteProduct,
  listProducts,
  Product,
  ProductPayload,
  restoreProduct,
  updateProduct,
} from "@/lib/api/product-api";

const DELETED_STATUS = "DELETE";

const emptyForm = {
  sku: "",
  productName: "",
  description: "",
  category: "",
  unit: "",
};

const unitOptions = ["PCS", "BOX", "KG", "G", "M", "CM"];

export function ProductPage() {
  const { user } = useAppShell();

  return (
    <ProductContent
      canCreate={canCreateProduct(user)}
      canWrite={canWriteProduct(user)}
    />
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
  const { isSubmitting, run } = useAsyncAction();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [restoringProduct, setRestoringProduct] = useState<Product | null>(
    null,
  );
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldError, setFieldError] = useState("");

  const hasProductChanges = editingProduct
    ? form.sku.trim() !== editingProduct.sku ||
      form.productName.trim() !== editingProduct.product_name ||
      form.description.trim() !== (editingProduct.description ?? "") ||
      form.category.trim() !== (editingProduct.category ?? "") ||
      form.unit.trim() !== (editingProduct.unit ?? "")
    : true;

  async function loadProducts() {
    setIsLoading(true);
    try {
      setProducts(await listProducts());
    } catch (error) {
      showRequestError("Unable to load products", error);
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

    if (editingProduct && !hasProductChanges) {
      return;
    }

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

    await run(async () => {
      if (editingProduct) {
        await updateProduct(editingProduct.product_id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      setFormOpen(false);
      await loadProducts();
    }, "Product action failed");
  }

  async function handleDelete() {
    if (!deletingProduct) {
      return;
    }

    await run(async () => {
      await deleteProduct(deletingProduct.product_id);
      toast.success("Product deleted");
      setDeletingProduct(null);
      await loadProducts();
    }, "Delete failed");
  }

  async function handleRestore() {
    if (!restoringProduct) {
      return;
    }

    await run(async () => {
      await restoreProduct(restoringProduct.product_id);
      toast.success("Product restored");
      setRestoringProduct(null);
      await loadProducts();
    }, "Restore failed");
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
      {
        key: "category",
        header: "Category",
        cell: (product) => product.category || "N/A",
      },
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
        cell: (product) => {
          if (!canWrite) {
            return <span className="text-xs text-slate-400">Read only</span>;
          }

          const isDeleted = product.status.toUpperCase() === DELETED_STATUS;

          return isDeleted ? (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoringProduct(product)}
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditForm(product)}
              >
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
          );
        },
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

      <Dialog
        open={Boolean(detailProduct)}
        onOpenChange={(open) => !open && setDetailProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {detailProduct?.product_name ?? "Product details"}
            </DialogTitle>
            <DialogDescription>
              Double-click any product row to inspect its full information.
            </DialogDescription>
          </DialogHeader>
          {detailProduct ? (
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <DetailItem label="SKU" value={detailProduct.sku} />
              <DetailItem
                label="Status"
                value={<StatusBadge status={detailProduct.status} />}
              />
              <DetailItem
                label="Category"
                value={detailProduct.category || "N/A"}
              />
              <DetailItem label="Unit" value={detailProduct.unit || "N/A"} />
              <DetailItem
                label="Created By"
                value={detailProduct.created_by || "N/A"}
              />
              <DetailItem
                label="Updated By"
                value={detailProduct.updated_by || "N/A"}
              />
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

      <CrudFormDialog
        open={formOpen}
        title={editingProduct ? "Edit product" : "Create product"}
        description="Keep product details consistent for all warehouse workflows."
        isSubmitting={isSubmitting}
        submitText="Save Product"
        submitDisabled={!hasProductChanges}
        error={fieldError}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(event) =>
                setForm({ ...form, sku: event.target.value })
              }
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
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={form.unit}
              onChange={(event) =>
                setForm({ ...form, unit: event.target.value })
              }
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
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </div>
      </CrudFormDialog>

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete product"
        description={`Delete ${deletingProduct?.product_name ?? "this product"}? You can restore it later.`}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(restoringProduct)}
        title="Restore product"
        description={`Restore ${restoringProduct?.product_name ?? "this product"} and make it active again?`}
        confirmText="Undo"
        submittingText="Restoring..."
        confirmVariant="default"
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setRestoringProduct(null)}
        onConfirm={handleRestore}
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
