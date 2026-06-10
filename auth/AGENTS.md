# Auth Service Agent Instructions

## Service Overview

This is the Spring Boot Auth Service of the WNS project.

Port:

- 5001

Communication:

- API Gateway -> Auth Service: gRPC/Protobuf
- Auth Service -> Auth Database: PostgreSQL

## Responsibilities

The Auth Service is responsible for:

- User registration
- Login by mail and password
- JWT access_token generation
- JWT access_token validation
- getMe current user information
- User management
- User profile management
- Role management
- Password hashing
- Authentication logic

Only access_token is required.

Do not implement refresh_token unless explicitly requested.

## Technology Rules

Use:

- Java 17
- Spring Boot 3.5.x
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- Lombok if already included
- gRPC with a dependency compatible with Spring Boot 3.5.x

Important:

- Do not use Spring gRPC Server if it requires Spring Boot 4.x.
- Add gRPC manually using a compatible library/version for Spring Boot 3.5.x.
- Prefer a stable gRPC starter compatible with Spring Boot 3.x.
- Do not upgrade the whole project to Spring Boot 4.x unless explicitly requested.


## Database

Database:

- PostgreSQL Auth Database

Main tables:

- auth_users
- user_profiles
- roles
- user_roles

All primary keys use UUID.

## Auth Database ERD Summary

### auth_users

Stores user account information.

Columns:

- user_id UUID primary key
- username VARCHAR(100) not null
- mail VARCHAR(255) not null
- password VARCHAR(255) not null
- status VARCHAR(50) not null
- created_at TIMESTAMP not null
- updated_at TIMESTAMP not null

Notes:

- username is not unique at database level.
- mail is not unique at database level.
- status has no database CHECK constraint.
- Status validation is handled in backend code.

### user_profiles

Stores user profile information.

Columns:

- profile_id UUID primary key
- phone_number VARCHAR(20)
- address TEXT
- department VARCHAR(100)
- user_id UUID not null foreign key to auth_users.user_id
- created_at TIMESTAMP not null
- updated_at TIMESTAMP not null

### roles

Stores role information.

Columns:

- role_id UUID primary key
- role_name VARCHAR(100) not null
- description TEXT
- created_at TIMESTAMP not null
- updated_at TIMESTAMP not null

### user_roles

Stores user-role mapping.

Columns:

- user_id UUID not null foreign key to auth_users.user_id
- role_id UUID not null foreign key to roles.role_id
- assigned_at TIMESTAMP not null

Primary key:

- composite primary key: user_id, role_id

---

## Important Database Rules

- Do not auto-create tables from entities.
- Do not auto-update database schema from entities.
- Disable Hibernate automatic schema generation.
- All database changes must be manually written as SQL scripts.
- Do not add Flyway or Liquibase unless requested.

## Security Rules

- Never store plain text password.
- Always hash passwords before saving.
- Use JWT access_token.
- JWT generation and validation must stay inside Auth Service.
- Status validation can be handled in backend code.
- Do not add database CHECK constraint for status unless requested.
- Time fields are sent from backend application code.
- Do not rely on database server default time for created_at, updated_at, or assigned_at.

## Code Style

- Apply MVC architecture.
- For gRPC APIs, use GrpcController/GrpcHandler -> Service -> Repository.
- Controllers/GrpcHandlers only receive requests, validate basic input, call services, and return responses.
- Put business logic inside service classes.
- Put database access inside repository classes.
- Use Spring Security.
- Use Spring Data JPA.
- Use PostgreSQL Driver.
- Use Lombok if already included.
- Use DTOs for request and response objects.
- Use mapper classes to convert between:
    - gRPC generated classes
    - DTOs
    - Entities
- Do not put business logic inside generated gRPC classes.