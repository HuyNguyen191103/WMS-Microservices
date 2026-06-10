# Client Agent Instructions

## Service Overview

This is the NextJS client of the WNS project.

Port:

- 3000

Communication:

- Client calls API Gateway through RESTful HTTP/JSON.
- Client must not call Auth Service or Biz Service directly.
- Client must not use gRPC directly.

## Responsibilities

The client is responsible for:

- Login UI
- Product screens
- Warehouse screens
- Inbound screens
- Outbound screens
- Inventory screens
- Sending access_token to API Gateway
- Handling unauthorized responses

## Authentication Rules

- Only access_token is used.
- Do not implement refresh_token.
- Send token to API Gateway using Authorization header:

## API Rules

- All API requests must go through API Gateway.
- Do not hardcode service URLs like Auth Service port 5001 or Biz Service port 5002.
- Use environment variables for API Gateway base URL.

Example:

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

## Code Style

- Use TypeScript.
- Use clear component names.
- Keep API calling logic separated from UI components.
- Do not put business calculation logic deeply inside UI components.
- Prefer reusable components for forms, tables, modals, and buttons.
- Only use Tailwind CSS and shadcn/ui when coding UI.
- If another UI library is needed, ask for confirmation before using it.
- Always store access_token in cookies.
- After login, call getMe API and store user information in localStorage.
- Design UI to be clear, intuitive, easy to use, and visually balanced.
- Do not focus on colorful or overly decorative UI.
- Write clean code and follow best practices.
- Avoid duplicated code.
- Do not use Vietnamese in code or UI unless explicitly requested.
