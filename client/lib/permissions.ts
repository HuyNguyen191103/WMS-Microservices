import type { UserInfo } from "@/lib/auth-api";
import { hasAnyRole } from "@/lib/session";

export const ACTIVITY_LOG_READ_ROLES = ["ADMIN", "DIRECTOR"];
export const PRODUCT_CREATE_ROLES = [
  "ADMIN",
  "DIRECTOR",
  "MANAGER",
  "EMPLOYEE",
];
export const PRODUCT_WRITE_ROLES = ["ADMIN", "DIRECTOR", "MANAGER"];
export const WAREHOUSE_WRITE_ROLES = ["ADMIN", "DIRECTOR", "MANAGER"];

export function canReadActivityLogs(user: UserInfo | null) {
  return hasAnyRole(user, ACTIVITY_LOG_READ_ROLES);
}

export function canCreateProduct(user: UserInfo | null) {
  return hasAnyRole(user, PRODUCT_CREATE_ROLES);
}

export function canWriteProduct(user: UserInfo | null) {
  return hasAnyRole(user, PRODUCT_WRITE_ROLES);
}

export function canWriteWarehouse(user: UserInfo | null) {
  return hasAnyRole(user, WAREHOUSE_WRITE_ROLES);
}
