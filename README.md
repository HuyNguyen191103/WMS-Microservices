# WNS – Warehouse Management System

WNS là hệ thống quản lý kho được xây dựng theo kiến trúc nhiều service. Hệ thống hỗ trợ quản lý sản phẩm, kho và vị trí lưu trữ, phiếu nhập hàng, tồn kho, lịch sử giao dịch và nhật ký hoạt động của người dùng.

## Kiến trúc tổng quan

```text
┌──────────────────────┐
│   Next.js Client     │
└──────────┬───────────┘
           │ REST/HTTP
           ▼
┌──────────────────────┐
│ NestJS API Gateway   │
└──────────┬───────────┘
           │ gRPC
           ├──────────────────────────────┐
           ▼                              ▼
┌──────────────────────┐       ┌──────────────────────┐
│ Auth Service         │       │ WMS Service          │
│ Spring Boot          │       │ NestJS               │
└──────────┬───────────┘       └──────────┬───────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐       ┌──────────────────────┐
│ PostgreSQL: auth_db  │       │ PostgreSQL: biz_db   │
└──────────────────────┘       └──────────────────────┘
```

### Thành phần hệ thống

- **Client:** cung cấp giao diện đăng nhập và quản lý các nghiệp vụ kho.
- **API Gateway:** cung cấp REST API cho client, xác thực JWT, kiểm tra quyền và chuyển tiếp yêu cầu đến các service.
- **Auth Service:** quản lý tài khoản, hồ sơ người dùng, vai trò, đăng nhập và phát hành JWT.
- **WMS Service:** xử lý sản phẩm, kho, vị trí lưu trữ, nhập hàng, tồn kho và nhật ký hoạt động.
- **Proto:** chứa các contract Protocol Buffers dùng chung cho giao tiếp gRPC.

## Chức năng chính

- Đăng ký và đăng nhập tài khoản.
- Xác thực bằng JWT.
- Phân quyền người dùng theo role.
- Quản lý sản phẩm.
- Quản lý kho và vị trí lưu trữ.
- Tạo, cập nhật, hoàn thành và xóa phiếu nhập.
- Tự động cập nhật tồn kho khi hoàn thành phiếu nhập.
- Tra cứu tồn kho theo từng kho.
- Theo dõi lịch sử biến động tồn kho.
- Theo dõi nhật ký hoạt động của người dùng.
- Xóa mềm và khôi phục sản phẩm, kho, vị trí lưu trữ.
- Dashboard tổng hợp dữ liệu hệ thống.

> Module **Outbound** hiện mới có cấu trúc dữ liệu và giao diện dự kiến, chưa có luồng API và nghiệp vụ hoàn chỉnh.

## Công nghệ sử dụng

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Lucide Icons
- Sonner Toast

### API Gateway

- Node.js
- NestJS 11
- TypeScript
- REST API
- gRPC Client
- Class Validator
- JWT RS256
- Role-based authorization

### Auth Service

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- BCrypt
- JJWT
- gRPC
- Gradle

### WMS Service

- NestJS 11
- TypeScript
- gRPC
- TypeORM
- PostgreSQL
- Database Transaction

### Công nghệ chung

- PostgreSQL
- Protocol Buffers
- gRPC
- Jest
- JUnit
- ESLint
- Prettier

## Cấu trúc thư mục

```text
final_project/
├── client/          # Giao diện Next.js
├── api-gateway/     # REST API, xác thực JWT và phân quyền
├── auth/            # Auth Service sử dụng Spring Boot
├── wms-service/     # Service xử lý nghiệp vụ quản lý kho
├── proto/           # Contract gRPC dùng chung
└── scripts/         # Script generate TypeScript từ proto
```

## Yêu cầu môi trường

Trước khi chạy dự án, cần cài đặt:

- Node.js 20 trở lên
- npm
- Java 17
- PostgreSQL
- Gradle Wrapper đã được cung cấp trong Auth Service

- Cần bảo đảm Auth Service và API Gateway sử dụng đúng cặp RSA key.
- Source hiện tại chưa có migration hoặc script khởi tạo database.
- Module Outbound chưa được hoàn thiện.
