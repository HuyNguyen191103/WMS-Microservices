# WNS – Warehouse Management System

WNS là hệ thống quản lý kho được xây dựng theo kiến trúc nhiều service. Hệ thống hỗ trợ quản lý sản phẩm, kho và vị trí lưu trữ, phiếu nhập hàng, tồn kho, lịch sử giao dịch và nhật ký hoạt động của người dùng.

## Kiến trúc tổng quan

Next.js Client
      │ REST/HTTP
      ▼
NestJS API Gateway
      │
      ├── gRPC ──► Auth Service ──► PostgreSQL 
      │             Spring Boot
      │
      └── gRPC ──► WMS Service ───► PostgreSQL 
                    NestJS



**Công nghệ sử dụng:**
Frontend
Next.js 16
React 19
TypeScript
Tailwind CSS 4
Radix UI
Lucide Icons
Sonner Toast
API Gateway
Node.js
NestJS 11
TypeScript
REST API
gRPC Client
Class Validator
JWT RS256 và role-based authorization
**Auth Service:**
Java 17
Spring Boot 3
Spring Security
Spring Data JPA
Hibernate
BCrypt
JJWT
gRPC
Gradle
**WMS Service:**
NestJS 11
TypeScript
gRPC
TypeORM
PostgreSQL


**Cấu trúc thư mục**
final_project/
├── client/          # Giao diện Next.js
├── api-gateway/     # REST API, JWT validation và phân quyền
├── auth/            # Auth Service viết bằng Spring Boot
├── wms-service/     # WMS Service xử lý nghiệp vụ kho
├── proto/           # Contract gRPC dùng chung
└── scripts/         # Script generate TypeScript từ proto
