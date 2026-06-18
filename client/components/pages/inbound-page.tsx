"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  MinusCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
import { useAsyncAction } from "@/hooks/use-async-action";
import { formatDateTime } from "@/lib/format";
import {
  canCompleteInbound,
  canCreateInbound,
  canWriteInbound,
} from "@/lib/permissions";
import { showRequestError } from "@/lib/request-error";
import {
  completeInbound,
  createInbound,
  deleteInbound,
  Inbound,
  InboundPayload,
  listInbounds,
  updateInbound,
} from "@/lib/api/inbound-api";
import { listProducts, Product } from "@/lib/api/product-api";
import {
  listWarehouseLocations,
  listWarehouses,
  Warehouse,
  WarehouseLocation,
} from "@/lib/api/warehouse-api";

type InboundItemForm = {
  productId: string;
  locationId: string;
  actualQty: string;
};

type InboundForm = {
  inboundNo: string;
  warehouseId: string;
  supplierName: string;
  actualDate: string;
  items: InboundItemForm[];
};

const terminalStatuses = new Set(["DONE", "DELETE", "DELETED"]);
const ACTIVE_STATUS = "ACTIVE";
const selectClassName =
  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50";

function makeEmptyItem(): InboundItemForm {
  return {
    productId: "",
    locationId: "",
    actualQty: "1",
  };
}

function makeEmptyForm(): InboundForm {
  return {
    inboundNo: "",
    warehouseId: "",
    supplierName: "",
    actualDate: "",
    items: [makeEmptyItem()],
  };
}

export function InboundPage() {
  const { user } = useAppShell();

  return (
    <InboundContent
      canCreate={canCreateInbound(user)}
      canWrite={canWriteInbound(user)}
      canComplete={canCompleteInbound(user)}
    />
  );
}

function InboundContent({
  canCreate,
  canWrite,
  canComplete,
}: {
  canCreate: boolean;
  canWrite: boolean;
  canComplete: boolean;
}) {
  const [inbounds, setInbounds] = useState<Inbound[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locationsByWarehouseId, setLocationsByWarehouseId] = useState<
    Record<string, WarehouseLocation[]>
  >({});
  const [loadingLocationWarehouseIds, setLoadingLocationWarehouseIds] =
    useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const { isSubmitting, run } = useAsyncAction();
  const [formOpen, setFormOpen] = useState(false);
  const [editingInbound, setEditingInbound] = useState<Inbound | null>(null);
  const [detailInbound, setDetailInbound] = useState<Inbound | null>(null);
  const [deletingInbound, setDeletingInbound] = useState<Inbound | null>(null);
  const [completingInbound, setCompletingInbound] = useState<Inbound | null>(
    null,
  );
  const [form, setForm] = useState<InboundForm>(() => makeEmptyForm());
  const [fieldError, setFieldError] = useState("");

  const allLocations = useMemo(
    () => Object.values(locationsByWarehouseId).flat(),
    [locationsByWarehouseId],
  );

  const activeWarehouses = useMemo(
    () =>
      warehouses.filter(
        (warehouse) => warehouse.status.toUpperCase() === ACTIVE_STATUS,
      ),
    [warehouses],
  );

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) => product.status.toUpperCase() === ACTIVE_STATUS,
      ),
    [products],
  );

  const currentLocations = form.warehouseId
    ? (locationsByWarehouseId[form.warehouseId] ?? []).filter(
        (location) => location.status.toUpperCase() === ACTIVE_STATUS,
      )
    : [];
  const isLoadingCurrentLocations = form.warehouseId
    ? loadingLocationWarehouseIds.includes(form.warehouseId)
    : false;

  const hasInboundChanges = editingInbound
    ? form.inboundNo.trim() !== editingInbound.inboundNo ||
      form.warehouseId !== editingInbound.warehouseId ||
      form.supplierName.trim() !== (editingInbound.supplierName ?? "") ||
      form.actualDate !== toDateInputValue(editingInbound.actualDate) ||
      form.items.length !== editingInbound.items.length ||
      form.items.some((item, index) => {
        const originalItem = editingInbound.items[index];
        return (
          !originalItem ||
          item.productId !== originalItem.productId ||
          item.locationId !== originalItem.locationId ||
          Number(item.actualQty) !== originalItem.actualQty
        );
      })
    : true;

  async function loadInbounds() {
    setIsLoading(true);
    try {
      setInbounds(await listInbounds());
    } catch (error) {
      showRequestError("Unable to load inbound orders", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadLookups() {
    setIsLoadingLookups(true);
    try {
      const [loadedWarehouses, loadedProducts] = await Promise.all([
        listWarehouses(),
        listProducts(),
      ]);
      setWarehouses(loadedWarehouses);
      setProducts(loadedProducts);
    } catch (error) {
      showRequestError("Unable to load form options", error);
    } finally {
      setIsLoadingLookups(false);
    }
  }

  async function loadLocationsForWarehouse(warehouseId: string) {
    if (!warehouseId) {
      return [];
    }

    const cachedLocations = locationsByWarehouseId[warehouseId];
    if (cachedLocations) {
      return cachedLocations;
    }

    setLoadingLocationWarehouseIds((current) =>
      current.includes(warehouseId) ? current : [...current, warehouseId],
    );

    try {
      const loadedLocations = await listWarehouseLocations(warehouseId);
      setLocationsByWarehouseId((current) => ({
        ...current,
        [warehouseId]: loadedLocations,
      }));
      return loadedLocations;
    } catch (error) {
      showRequestError("Unable to load warehouse locations", error);
      return [];
    } finally {
      setLoadingLocationWarehouseIds((current) =>
        current.filter((id) => id !== warehouseId),
      );
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInbounds();
      void loadLookups();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function openCreateForm() {
    setEditingInbound(null);
    setForm(makeEmptyForm());
    setFieldError("");
    setFormOpen(true);
  }

  function openEditForm(inbound: Inbound) {
    setEditingInbound(inbound);
    setForm({
      inboundNo: inbound.inboundNo,
      warehouseId: inbound.warehouseId,
      supplierName: inbound.supplierName ?? "",
      actualDate: toDateInputValue(inbound.actualDate),
      items: inbound.items.length
        ? inbound.items.map((item) => ({
            productId: item.productId,
            locationId: item.locationId,
            actualQty: String(item.actualQty),
          }))
        : [makeEmptyItem()],
    });
    setFieldError("");
    setFormOpen(true);
    void loadLocationsForWarehouse(inbound.warehouseId);
  }

  function openDetails(inbound: Inbound) {
    setDetailInbound(inbound);
    void loadLocationsForWarehouse(inbound.warehouseId);
  }

  function handleWarehouseChange(warehouseId: string) {
    setForm((current) => ({
      ...current,
      warehouseId,
      items: current.items.map((item) => ({ ...item, locationId: "" })),
    }));
    void loadLocationsForWarehouse(warehouseId);
  }

  function updateItem(index: number, nextItem: Partial<InboundItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...nextItem } : item,
      ),
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, makeEmptyItem()],
    }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function buildPayload() {
    const inboundNo = form.inboundNo.trim();
    const supplierName = form.supplierName.trim();

    if (!inboundNo) {
      return "Inbound number is required.";
    }

    if (!form.warehouseId) {
      return "Warehouse is required.";
    }

    if (!form.items.length) {
      return "At least one item is required.";
    }

    const items = form.items.map((item) => {
      const actualQty = Number(item.actualQty);
      return {
        productId: item.productId,
        locationId: item.locationId,
        actualQty,
      };
    });

    const invalidItem = items.find(
      (item) =>
        !item.productId ||
        !item.locationId ||
        !Number.isInteger(item.actualQty) ||
        item.actualQty < 1,
    );

    if (invalidItem) {
      return "Each item needs a product, location, and quantity of at least 1.";
    }

    const payload: InboundPayload = {
      inboundNo,
      warehouseId: form.warehouseId,
      supplierName,
      actualDate: form.actualDate || undefined,
      items,
    };

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingInbound && !hasInboundChanges) {
      return;
    }

    const payload = buildPayload();
    if (typeof payload === "string") {
      setFieldError(payload);
      return;
    }

    await run(async () => {
      if (editingInbound) {
        await updateInbound(editingInbound.inboundOrderId, payload);
        toast.success("Inbound order updated");
      } else {
        await createInbound(payload);
        toast.success("Inbound order created");
      }

      setFormOpen(false);
      await loadInbounds();
    }, "Inbound action failed");
  }

  async function handleDelete() {
    if (!deletingInbound) {
      return;
    }

    await run(async () => {
      await deleteInbound(deletingInbound.inboundOrderId);
      toast.success("Inbound order deleted");
      setDeletingInbound(null);
      await loadInbounds();
    }, "Delete failed");
  }

  async function handleComplete() {
    if (!completingInbound) {
      return;
    }

    await run(async () => {
      await completeInbound(completingInbound.inboundOrderId);
      toast.success("Inbound order completed");
      setCompletingInbound(null);
      await loadInbounds();
    }, "Done failed");
  }

  function getWarehouseLabel(warehouseId: string) {
    const warehouse = warehouses.find(
      (item) => item.warehouse_id === warehouseId,
    );
    if (!warehouse) {
      return warehouseId || "N/A";
    }

    return `${warehouse.warehouse_code} - ${warehouse.warehouse_name}`;
  }

  function getProductLabel(productId: string) {
    const product = products.find((item) => item.product_id === productId);
    if (!product) {
      return productId || "N/A";
    }

    return `${product.sku} - ${product.product_name}`;
  }

  function getLocationLabel(locationId: string) {
    const location = allLocations.find(
      (item) => item.location_id === locationId,
    );
    if (!location) {
      return locationId || "N/A";
    }

    return location.zone || location.location_id;
  }

  const columns: DataTableColumn<Inbound>[] = [
    {
      key: "inboundNo",
      header: "Inbound No",
      cell: (inbound) => (
        <div>
          <p className="font-medium text-slate-950">{inbound.inboundNo}</p>
          <p className="text-xs text-slate-500">
            {formatDateTime(inbound.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      cell: (inbound) => inbound.supplierName || "N/A",
    },
    {
      key: "warehouse",
      header: "Warehouse",
      cell: (inbound) => getWarehouseLabel(inbound.warehouseId),
    },
    {
      key: "actualDate",
      header: "Actual Date",
      cell: (inbound) => formatDateTime(inbound.actualDate),
    },
    {
      key: "items",
      header: "Items",
      cell: (inbound) => `${inbound.items.length} item(s)`,
    },
    {
      key: "totalQty",
      header: "Total Qty",
      cell: (inbound) => getTotalQuantity(inbound).toLocaleString("en"),
    },
    {
      key: "status",
      header: "Status",
      cell: (inbound) => <StatusBadge status={inbound.status} />,
    },
    {
      key: "createdBy",
      header: "Created By",
      cell: (inbound) => inbound.createdBy || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (inbound) => {
        const isLocked = isTerminalStatus(inbound.status);

        return (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDetails(inbound)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            {!isLocked && canWrite ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditForm(inbound)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ) : null}
            {!isLocked && canComplete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompletingInbound(inbound)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Done
              </Button>
            ) : null}
            {!isLocked && canWrite ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingInbound(inbound)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Receiving"
        title="Inbound"
        description="Create and complete receiving orders for warehouse stock movements."
        action={
          canCreate ? (
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              New Inbound
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={inbounds}
        isLoading={isLoading}
        getRowKey={(inbound) => inbound.inboundOrderId}
        onRowDoubleClick={openDetails}
        emptyMessage="No inbound orders have been created yet."
      />

      <Dialog
        open={Boolean(detailInbound)}
        onOpenChange={(open) => !open && setDetailInbound(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailInbound?.inboundNo ?? "Inbound details"}
            </DialogTitle>
            <DialogDescription>
              Review inbound header information and received items.
            </DialogDescription>
          </DialogHeader>
          {detailInbound ? (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Warehouse"
                  value={getWarehouseLabel(detailInbound.warehouseId)}
                />
                <DetailItem
                  label="Supplier"
                  value={detailInbound.supplierName || "N/A"}
                />
                <DetailItem
                  label="Status"
                  value={<StatusBadge status={detailInbound.status} />}
                />
                <DetailItem
                  label="Actual Date"
                  value={formatDateTime(detailInbound.actualDate)}
                />
                <DetailItem
                  label="Created By"
                  value={detailInbound.createdBy || "N/A"}
                />
                <DetailItem
                  label="Updated"
                  value={formatDateTime(detailInbound.updatedAt)}
                />
              </div>

              <div className="rounded-md border border-slate-200">
                <div className="grid grid-cols-[1.5fr_1fr_96px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase text-slate-500">
                  <span>Product</span>
                  <span>Location</span>
                  <span className="text-right">Qty</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {detailInbound.items.map((item) => (
                    <div
                      key={item.inboundItemId}
                      className="grid grid-cols-[1.5fr_1fr_96px] gap-3 px-4 py-3 text-sm text-slate-700"
                    >
                      <span>{getProductLabel(item.productId)}</span>
                      <span>{getLocationLabel(item.locationId)}</span>
                      <span className="text-right font-medium text-slate-950">
                        {item.actualQty.toLocaleString("en")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailInbound(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudFormDialog
        open={formOpen}
        title={editingInbound ? "Edit inbound" : "Create inbound"}
        description="Select warehouse, products, and locations from existing records."
        isSubmitting={isSubmitting}
        submitText="Save Inbound"
        submitDisabled={isLoadingLookups || !hasInboundChanges}
        error={fieldError}
        contentClassName="max-h-[90vh] max-w-5xl overflow-y-auto"
        formClassName="space-y-5"
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="inboundNo">Inbound No</Label>
            <Input
              id="inboundNo"
              value={form.inboundNo}
              onChange={(event) =>
                setForm({ ...form, inboundNo: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse</Label>
            <select
              id="warehouseId"
              value={form.warehouseId}
              disabled={isLoadingLookups}
              onChange={(event) => handleWarehouseChange(event.target.value)}
              className={selectClassName}
            >
              <option value="">Select warehouse</option>
              {activeWarehouses.map((warehouse) => (
                <option
                  key={warehouse.warehouse_id}
                  value={warehouse.warehouse_id}
                >
                  {warehouse.warehouse_code} - {warehouse.warehouse_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier</Label>
            <Input
              id="supplierName"
              value={form.supplierName}
              onChange={(event) =>
                setForm({ ...form, supplierName: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actualDate">Actual Date</Label>
            <Input
              id="actualDate"
              type="date"
              value={form.actualDate}
              onChange={(event) =>
                setForm({ ...form, actualDate: event.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Items</p>
              <p className="text-sm text-slate-500">
                Add products and receiving locations for this inbound order.
              </p>
            </div>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1.4fr_1.1fr_120px_44px]"
              >
                <div className="space-y-2">
                  <Label htmlFor={`product-${index}`}>Product</Label>
                  <select
                    id={`product-${index}`}
                    value={item.productId}
                    disabled={isLoadingLookups}
                    onChange={(event) =>
                      updateItem(index, { productId: event.target.value })
                    }
                    className={selectClassName}
                  >
                    <option value="">Select product</option>
                    {activeProducts.map((product) => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {product.sku} - {product.product_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <select
                    id={`location-${index}`}
                    value={item.locationId}
                    disabled={!form.warehouseId || isLoadingCurrentLocations}
                    onChange={(event) =>
                      updateItem(index, { locationId: event.target.value })
                    }
                    className={selectClassName}
                  >
                    <option value="">
                      {form.warehouseId
                        ? "Select location"
                        : "Select warehouse first"}
                    </option>
                    {currentLocations.map((location) => (
                      <option
                        key={location.location_id}
                        value={location.location_id}
                      >
                        {location.zone || location.location_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`qty-${index}`}>Qty</Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    min={1}
                    step={1}
                    value={item.actualQty}
                    onChange={(event) =>
                      updateItem(index, { actualQty: event.target.value })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={form.items.length === 1}
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CrudFormDialog>

      <ConfirmDialog
        open={Boolean(deletingInbound)}
        title="Delete inbound"
        description={`Delete ${deletingInbound?.inboundNo ?? "this inbound order"}? This will mark the order as DELETE.`}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeletingInbound(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(completingInbound)}
        title="Mark inbound as done"
        description={`Complete ${completingInbound?.inboundNo ?? "this inbound order"} and record inventory movements?`}
        isSubmitting={isSubmitting}
        confirmText="Done"
        submittingText="Completing..."
        confirmVariant="default"
        onOpenChange={(open) => !open && setCompletingInbound(null)}
        onConfirm={handleComplete}
      />
    </>
  );
}

function isTerminalStatus(status?: string) {
  return terminalStatuses.has((status || "").toUpperCase());
}

function getTotalQuantity(inbound: Inbound) {
  return inbound.items.reduce((total, item) => total + item.actualQty, 0);
}

function toDateInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-950">{value}</div>
    </div>
  );
}
