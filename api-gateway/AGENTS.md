# API Gateway Agent Instructions

## Service Overview

This is the NestJS API Gateway of the WNS project.

Port:

- 3001

Communication:

- Client -> Gateway: RESTful HTTP/JSON
- Gateway -> Auth Service: gRPC/Protobuf
- Gateway -> Biz Service: gRPC/Protobuf

## Responsibilities

The API Gateway is responsible for:

- Exposing REST APIs to the client
- Request validation
- Authentication delegation
- REST-to-gRPC mapping
- Calling Auth Service by gRPC
- Calling Biz Service by gRPC
- Returning normalized responses to the client

## Strict Rules

- Do not connect to PostgreSQL directly.
- Do not create database entities in Gateway.
- Do not add TypeORM/Prisma database logic here.
- Do not put business logic in Gateway.
- Do not implement JWT generation in Gateway.
- Do not directly read or write Auth Database.
- Do not directly read or write Biz Database.

## Authentication Flow

For protected APIs:

1. Client sends request with Authorization header.
2. Gateway extracts access_token.
3. Gateway calls Auth Service through gRPC to validate token.
4. If token is valid, Gateway forwards request to Biz Service.
5. If token is invalid, Gateway returns 401 Unauthorized.

## gRPC Rules

Gateway acts as gRPC client.

Suggested proto files:

- auth.proto
- biz.proto

Gateway should call Auth Service for:

- login
- validateToken
- getUserProfile
- getUserRoles

Gateway should call Biz Service for:

- product CRUD
- warehouse CRUD
- inbound order operations
- outbound order operations
- inventory operations

## Code Style

- Use DTOs for request validation.
- Use class-validator and class-transformer.
- Use modules by domain.
- Keep controller thin.
- Put gRPC calling logic inside service/provider classes.
- Follow NestJS modular architecture