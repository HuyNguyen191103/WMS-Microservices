"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, MapPin, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CrudFormDialog } from "@/components/crud-form-dialog";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncAction } from "@/hooks/use-async-action";
import { formatDateTime } from "@/lib/format";
import { canWriteWarehouse } from "@/lib/permissions";
import { showRequestError } from "@/lib/request-error";
import {
  createWarehouseLocation,
  createWarehouse,
  deleteWarehouseLocation,
  deleteWarehouse,
  listWarehouseLocations,
  listWarehouses,
  restoreWarehouseLocation,
  restoreWarehouse,
  updateWarehouseLocation,
  updateWarehouse,
  Warehouse,
  WarehouseLocation,
  WarehouseLocationPayload,
  WarehousePayload,
} from "@/lib/api/warehouse-api";

const ACTIVE_STATUS = "ACTIVE";
const DELETED_STATUS = "DELETE";

const emptyForm = {
  warehouseCode: "",
  warehouseName: "",
  address: "",
};

const emptyLocationForm = {
  zone: "",
};

export function WarehousePage() {
  const { user } = useAppShell();

  return <WarehouseContent canWrite={canWriteWarehouse(user)} />;
}

function WarehouseContent({ canWrite }: { canWrite: boolean }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSubmitting, run } = useAsyncAction();
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [restoringWarehouse, setRestoringWarehouse] =
    useState<Warehouse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldError, setFieldError] = useState("");
  const [detailWarehouse, setDetailWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<WarehouseLocation | null>(null);
  const [deletingLocation, setDeletingLocation] =
    useState<WarehouseLocation | null>(null);
  const [restoringLocation, setRestoringLocation] =
    useState<WarehouseLocation | null>(null);
  const [locationForm, setLocationForm] = useState(emptyLocationForm);
  const [locationFieldError, setLocationFieldError] = useState("");

  const hasWarehouseChanges = editingWarehouse
    ? form.warehouseCode.trim() !== editingWarehouse.warehouse_code ||
      form.warehouseName.trim() !== editingWarehouse.warehouse_name ||
      form.address.trim() !== (editingWarehouse.address ?? "")
    : true;

  const hasLocationChanges = editingLocation
    ? locationForm.zone.trim() !== (editingLocation.zone ?? "")
    : true;

  async function loadWarehouses() {
    setIsLoading(true);
    try {
      setWarehouses(await listWarehouses());
    } catch (error) {
      showRequestError("Unable to load warehouses", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWarehouses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function openCreateForm() {
    setEditingWarehouse(null);
    setForm(emptyForm);
    setFieldError("");
    setFormOpen(true);
  }

  function openEditForm(warehouse: Warehouse) {
    setEditingWarehouse(warehouse);
    setForm({
      warehouseCode: warehouse.warehouse_code,
      warehouseName: warehouse.warehouse_name,
      address: warehouse.address ?? "",
    });
    setFieldError("");
    setFormOpen(true);
  }

  async function openDetails(warehouse: Warehouse) {
    setDetailWarehouse(warehouse);
    await loadLocations(warehouse.warehouse_id);
  }

  async function loadLocations(warehouseId: string) {
    setIsLoadingLocations(true);
    try {
      setLocations(await listWarehouseLocations(warehouseId));
    } catch (error) {
      showRequestError("Unable to load warehouse locations", error);
    } finally {
      setIsLoadingLocations(false);
    }
  }

  function openCreateLocationForm() {
    setEditingLocation(null);
    setLocationForm(emptyLocationForm);
    setLocationFieldError("");
    setLocationFormOpen(true);
  }

  function openEditLocationForm(location: WarehouseLocation) {
    setEditingLocation(location);
    setLocationForm({
      zone: location.zone ?? "",
    });
    setLocationFieldError("");
    setLocationFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingWarehouse && !hasWarehouseChanges) {
      return;
    }

    if (!form.warehouseCode.trim() || !form.warehouseName.trim()) {
      setFieldError("Warehouse code and warehouse name are required.");
      return;
    }

    const payload: WarehousePayload = {
      warehouseCode: form.warehouseCode.trim(),
      warehouseName: form.warehouseName.trim(),
      address: form.address.trim(),
    };

    await run(async () => {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.warehouse_id, payload);
        toast.success("Warehouse updated");
      } else {
        await createWarehouse(payload);
        toast.success("Warehouse created");
      }

      setFormOpen(false);
      await loadWarehouses();
    }, "Warehouse action failed");
  }

  async function handleDelete() {
    if (!deletingWarehouse) {
      return;
    }

    await run(async () => {
      await deleteWarehouse(deletingWarehouse.warehouse_id);
      toast.success("Warehouse deleted");
      setDeletingWarehouse(null);
      await loadWarehouses();
    }, "Delete failed");
  }

  async function handleRestore() {
    if (!restoringWarehouse) {
      return;
    }

    await run(async () => {
      await restoreWarehouse(restoringWarehouse.warehouse_id);
      toast.success("Warehouse restored");
      setRestoringWarehouse(null);
      await loadWarehouses();
    }, "Restore failed");
  }

  async function handleLocationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingLocation && !hasLocationChanges) {
      return;
    }

    if (!detailWarehouse) {
      return;
    }

    if (!locationForm.zone.trim()) {
      setLocationFieldError("Zone is required.");
      return;
    }

    const payload: WarehouseLocationPayload = {
      warehouseId: detailWarehouse.warehouse_id,
      zone: locationForm.zone.trim(),
    };

    await run(async () => {
      if (editingLocation) {
        await updateWarehouseLocation(editingLocation.location_id, payload);
        toast.success("Warehouse location updated");
      } else {
        await createWarehouseLocation(payload);
        toast.success("Warehouse location created");
      }

      setLocationFormOpen(false);
      await loadLocations(detailWarehouse.warehouse_id);
    }, "Warehouse location action failed");
  }

  async function handleLocationDelete() {
    if (!deletingLocation || !detailWarehouse) {
      return;
    }

    await run(async () => {
      await deleteWarehouseLocation(deletingLocation.location_id);
      toast.success("Warehouse location deleted");
      setDeletingLocation(null);
      await loadLocations(detailWarehouse.warehouse_id);
    }, "Delete failed");
  }

  async function handleLocationRestore() {
    if (!restoringLocation || !detailWarehouse) {
      return;
    }

    await run(async () => {
      await restoreWarehouseLocation(restoringLocation.location_id);
      toast.success("Warehouse location restored");
      setRestoringLocation(null);
      await loadLocations(detailWarehouse.warehouse_id);
    }, "Restore failed");
  }

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title="Warehouse"
        description="Review and maintain warehouses as individual operational cards."
        action={
          canWrite ? (
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              New Warehouse
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingState message="Loading warehouses..." className="p-10" />
      ) : warehouses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.warehouse_id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{warehouse.warehouse_name}</CardTitle>
                    <CardDescription>
                      {warehouse.warehouse_code}
                    </CardDescription>
                  </div>
                  <StatusBadge status={warehouse.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="min-h-10">
                    {warehouse.address || "No address"}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div>
                    <p className="font-medium uppercase">Created</p>
                    <p className="mt-1 text-slate-700">
                      {formatDateTime(warehouse.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium uppercase">Updated</p>
                    <p className="mt-1 text-slate-700">
                      {formatDateTime(warehouse.updated_at)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openDetails(warehouse)}
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </Button>
                  {canWrite ? (
                    warehouse.status.toUpperCase() === DELETED_STATUS ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRestoringWarehouse(warehouse)}
                      >
                        <Undo2 className="h-4 w-4" />
                        Undo
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditForm(warehouse)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setDeletingWarehouse(warehouse)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-slate-500">
            No warehouses have been created yet.
          </CardContent>
        </Card>
      )}

      <CrudFormDialog
        open={formOpen}
        title={editingWarehouse ? "Edit warehouse" : "Create warehouse"}
        description="Define the facility details used by inventory workflows."
        isSubmitting={isSubmitting}
        submitText="Save Warehouse"
        submitDisabled={!hasWarehouseChanges}
        error={fieldError}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warehouseCode">Warehouse Code</Label>
            <Input
              id="warehouseCode"
              value={form.warehouseCode}
              onChange={(event) =>
                setForm({ ...form, warehouseCode: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warehouseName">Warehouse Name</Label>
            <Input
              id="warehouseName"
              value={form.warehouseName}
              onChange={(event) =>
                setForm({ ...form, warehouseName: event.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
          />
        </div>
      </CrudFormDialog>

      <ConfirmDialog
        open={Boolean(deletingWarehouse)}
        title="Delete warehouse"
        description={`Delete ${deletingWarehouse?.warehouse_name ?? "this warehouse"}? You can restore it later.`}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeletingWarehouse(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(restoringWarehouse)}
        title="Restore warehouse"
        description={`Restore ${restoringWarehouse?.warehouse_name ?? "this warehouse"}? Deleted locations will remain deleted.`}
        confirmText="Undo"
        submittingText="Restoring..."
        confirmVariant="default"
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setRestoringWarehouse(null)}
        onConfirm={handleRestore}
      />

      <Dialog
        open={Boolean(detailWarehouse)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailWarehouse(null);
            setLocations([]);
            setLocationFormOpen(false);
            setEditingLocation(null);
            setRestoringLocation(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {detailWarehouse?.warehouse_name ?? "Warehouse"} details
            </DialogTitle>
            <DialogDescription>
              Review and maintain warehouse locations for this facility.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {detailWarehouse?.warehouse_code}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {detailWarehouse?.address || "No address"}
                </p>
              </div>
              <StatusBadge status={detailWarehouse?.status} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Warehouse locations
              </p>
              <p className="text-sm text-slate-500">
                Zones registered under this warehouse.
              </p>
            </div>
            {canWrite &&
            detailWarehouse?.status.toUpperCase() === ACTIVE_STATUS ? (
              <Button size="sm" onClick={openCreateLocationForm}>
                <Plus className="h-4 w-4" />
                New Location
              </Button>
            ) : null}
          </div>

          {isLoadingLocations ? (
            <LoadingState message="Loading locations..." />
          ) : locations.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {locations.map((location) => (
                <div
                  key={location.location_id}
                  className="rounded-md border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {location.zone || "Unnamed zone"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {formatDateTime(location.updated_at)}
                      </p>
                    </div>
                    <StatusBadge status={location.status} />
                  </div>
                  {canWrite &&
                  detailWarehouse?.status.toUpperCase() === ACTIVE_STATUS ? (
                    <div className="mt-4 flex gap-2">
                      {location.status.toUpperCase() === DELETED_STATUS ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setRestoringLocation(location)}
                        >
                          <Undo2 className="h-4 w-4" />
                          Undo
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditLocationForm(location)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setDeletingLocation(location)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 p-8 text-center text-sm text-slate-500">
              No warehouse locations have been created yet.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CrudFormDialog
        open={locationFormOpen}
        title={
          editingLocation
            ? "Edit warehouse location"
            : "Create warehouse location"
        }
        description="Locations help group stock by zone inside a warehouse."
        isSubmitting={isSubmitting}
        submitText="Save Location"
        submitDisabled={!hasLocationChanges}
        error={locationFieldError}
        onOpenChange={setLocationFormOpen}
        onSubmit={handleLocationSubmit}
      >
        <div className="space-y-2">
          <Label htmlFor="zone">Zone</Label>
          <Input
            id="zone"
            value={locationForm.zone}
            onChange={(event) =>
              setLocationForm({ ...locationForm, zone: event.target.value })
            }
          />
        </div>
      </CrudFormDialog>

      <ConfirmDialog
        open={Boolean(deletingLocation)}
        title="Delete warehouse location"
        description={`Delete ${deletingLocation?.zone ?? "this location"}? You can restore it later.`}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
        onConfirm={handleLocationDelete}
      />

      <ConfirmDialog
        open={Boolean(restoringLocation)}
        title="Restore warehouse location"
        description={`Restore ${restoringLocation?.zone ?? "this location"} and make it active again?`}
        confirmText="Undo"
        submittingText="Restoring..."
        confirmVariant="default"
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setRestoringLocation(null)}
        onConfirm={handleLocationRestore}
      />
    </>
  );
}
