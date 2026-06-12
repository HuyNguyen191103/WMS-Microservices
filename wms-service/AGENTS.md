# Biz Service Agent Instructions

## Overview

This is the NestJS Biz Service of the WNS project.

Port: 5002

Communication:

* API Gateway -> Biz Service: gRPC
* Biz Service -> PostgreSQL

Responsibilities:

* Product Management
* Warehouse Management
* Inbound Management
* Outbound Management
* Inventory Management
* Activity Logging

---

## Authentication

Authentication is handled by Auth Service and API Gateway.

Biz Service must NOT:

* Validate JWT
* Generate JWT
* Verify JWT

Biz Service only consumes authenticated user context from Gateway.

---

## Architecture Rules

Use NestJS Modular Architecture.

```text
src/modules
├── product
├── warehouse
├── inbound
├── outbound
├── inventory
└── activity-log
```

Each module should contain:

* dto
* entities
* repositories
* services
* grpc

Responsibilities:

* gRPC Layer → request/response only
* Service Layer → business logic
* Repository Layer → database access
* Entity Layer → database mapping
---

## Communication Rules

This service is gRPC-first.

* Do NOT expose REST APIs
* Do NOT create HTTP controllers
* All communication must go through gRPC
* API Gateway is the only client

Suggested services:

* ProductService
* WarehouseService
* InboundService
* OutboundService
* InventoryService
* ActivityLogService

---

## Database Rules

Database: PostgreSQL

TypeORM:

```ts
synchronize: false
```

Rules:

* Never use synchronize: true
* Never auto-create database schema
* All schema changes must be SQL scripts
* Entity definitions must match database schema exactly

---

## PostgreSQL Mapping Rules

| PostgreSQL | TypeScript |
| ---------- | ---------- |
| uuid       | string     |
| varchar    | string     |
| text       | string     |
| int4       | number     |
| timestamp  | Date       |
| date       | Date       |

Rules:

* Use @PrimaryGeneratedColumn('uuid')
* Use explicit column types
* Use Date for DATE and TIMESTAMP
* Respect nullable columns
* Generate relations from foreign keys
* Generate @Unique decorators for database unique constraints

---

## Main Tables

### products

Stores product master data.

Entity: Product
Columns:
product_id       uuid PK
sku              varchar(50)
product_name     varchar(255)
description      text
category         varchar(100)
unit             varchar(50)
status           varchar(30)
created_by       varchar(100)
updated_by       varchar(100)
created_at       timestamp
updated_at       timestamp

### warehouses

Stores warehouse master data.

Entity: Warehouse
Columns:
warehouse_id     uuid PK
warehouse_code   varchar(50)
warehouse_name   varchar(255)
address          text
status           varchar(30)
created_by       varchar(100)
updated_by       varchar(100)
created_at       timestamp
updated_at       timestamp

### warehouse_locations

Entity: WarehouseLocation
Columns:
location_id      uuid PK
warehouse_id     uuid FK
zone             varchar(50)
status           varchar(30)
created_at       timestamp

### inbound_orders

Stores inbound order header data.

Entity: InboundOrder
Columns:
inbound_order_id uuid PK
inbound_no       varchar(50)
warehouse_id     uuid FK
supplier_name    varchar(255)
expected_date    date
actual_date      date
status           varchar(30)
approved_by      varchar(100)
approved_at      timestamp
created_by       varchar(100)
created_at       timestamp
updated_at       timestamp

### inbound_items

Stores inbound order item details.

Entity: InboundItem
Columns:
inbound_item_id  uuid PK
inbound_order_id uuid FK
product_id       uuid FK
location_id      uuid FK
expected_qty     int4
actual_qty       int4

### outbound_orders

Stores outbound order header data.

Entity: OutboundOrder
Columns:
outbound_order_id uuid PK
outbound_no       varchar(50)
warehouse_id      uuid FK
customer_name     varchar(255)
customer_phone    varchar(30)
customer_mail     varchar(255)
status            varchar(30)
approved_by       varchar(100)
approved_at       timestamp
created_by        varchar(100)
created_at        timestamp
updated_at        timestamp

### outbound_items

Stores outbound order item details.

Entity: OutboundItem
Columns:
outbound_item_id uuid PK
outbound_order_id uuid FK
product_id       uuid FK
requested_qty    int4
actual_qty       int4

### inventory_items

Stores current stock quantity.

Entity: InventoryItem
Columns:
inventory_id     uuid PK
warehouse_id     uuid FK
location_id      uuid FK
product_id       uuid FK
quantity         int4
updated_at       timestamp
Unique Constraint:
(warehouse_id, location_id, product_id)
Entity must include:
@Unique([
  'warehouseId',
  'locationId',
  'productId',
])

### inventory_transactions

Stores stock movement history.

Entity: InventoryTransaction
Columns:
transaction_id   uuid PK
product_id       uuid FK
warehouse_id     uuid FK
location_id      uuid FK nullable
transaction_type varchar(30)
quantity         int4
reference_no     varchar(50)
created_by       varchar(100)
created_at       timestamp

### activity_logs

Stores user activity logs.

Entity: ActivityLog
Columns:
log_id           uuid PK
user_id          varchar(100)
user_role        varchar(30)
action           varchar(100)
reference_type   varchar(50)
reference_id     uuid nullable
description      text
created_at       timestamp

---

## Important Schema Notes

### Inventory

Current stock is stored in:

```text
inventory_items
```

Do not store stock quantity in products.

Inventory uniqueness:

```ts
@Unique([
  'warehouseId',
  'locationId',
  'productId',
])
```

---

## Business Flows

Inbound:

1. Create inbound order
2. Add inbound items
3. Approve inbound order
4. Update inventory_items
5. Create inventory_transactions
6. Create activity_logs

Outbound:

1. Create outbound order
2. Add outbound items
3. Approve outbound order
4. Decrease inventory_items
5. Create inventory_transactions
6. Create activity_logs

---

## Code Style

* Use NestJS 11
* Use TypeScript
* Use DTOs
* Use class-validator
* Follow clean code principles
* Follow NestJS best practices
* Prefer gRPC-first design
* Keep handlers thin
* Keep services focused on business logic
* Keep repositories focused on persistence
* Use English
* No need Unit Test


promt detail:
- tiếp theo bạn hãy xây dựng CRUD cho module warehouse nha và bạn hãy expose các endpoint bên api-gateway luôn nha. Về phân quyền thì 3 role ADMIN, DIRECTOR, MANAGER, sẽ có quyền về CRUD nha còn EMPLOYEE thì chỉ có quyền đọc thoi và sẽ xử lý xác thực, phân quyền ở api-gateway bằng cách sử dụng ValidateAccessToken nha. còn ở wms-service hãy code theo hướng expose ra wms.proto trước ròi code theo proto nha và các createdAt, updatedAt sẽ tự set ở BE nha còn status sẽ là ACTIVE khi tạo còn khi delete sẽ đổi thành DELETE. Và khi bị DELETE thì vẫn cho get ra nha. bạn hãy đọc qua entities của warehouse và nếu thấy có gì thiếu xót hoặc chưa chắn chắn bạn hãy hỏi tôi trước chứ ko được tự ý xử lý nha