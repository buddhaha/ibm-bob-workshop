# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Multi-Service Architecture

**Python Backend (Port 8001)**: FastAPI with dual REST + MCP protocol support. MCP server MUST be created before FastAPI app (line 22 in server.py) to properly combine lifespans.

**Java Hold Service (Port 8080)**: Spring Boot service that calls Python backend's `/internal/bookings/from-hold` endpoint. Python endpoint returns HTTP 400 on booking failure so Java can detect and propagate errors.

**Frontend (Port 5173)**: React + Vite. API calls to Java service go through Python proxy endpoints (`/quotes`, `/holds`) which return `{"error": "..."}` with HTTP 200 when Java service unavailable - must check manually with `assertNotProxyError()`.

## Testing

**Backend**: Run from `booking_system_backend/` directory:
- `pytest` - all tests
- `pytest tests/test_services.py` - service layer only
- `pytest tests/test_rest.py` - REST API only
- `pytest -k test_name` - single test

**Frontend**: Run from `booking_system_frontend/`:
- `npm run build` - production build (required before deployment)
- `npm run lint` - ESLint check

## Critical Non-Obvious Patterns

**Seat Class System**: Three independent seat counters per flight (economy/business/galaxium). Booking/cancellation MUST update the correct counter based on `seat_class` field. Price multipliers: economy=1.0x, business=2.5x, galaxium=5.0x base_price.

**Database Seeding**: Backend auto-seeds on startup if `SEED_DEMO_DATA=true` (default). Seed skips if users table has data to avoid wiping registered users. Database can be SQLite (local) or PostgreSQL (production) via `DATABASE_URL` env var.

**Authentication**: No passwords - uses name+email combination. Frontend stores user in localStorage with key `'galaxium_user'`. Backend validates both name AND email must match for user lookup.

**Error Handling**: Services return `Union[SuccessType, ErrorResponse]`. ErrorResponse has `success=false`, `error`, `error_code`, and optional `details`. Check with `isinstance(result, ErrorResponse)` or `isErrorResponse()` helper.

**Java-Python Integration**: Java service uses `PythonBackendClient` to call Python's internal endpoint. Hold confirmation creates booking via Python backend, stores `booking_id` as `externalBookingReference` in Hold entity.

**MCP Tools**: Available for AI agents via FastMCP. Each tool creates its own DB session with try/finally cleanup. Tools raise exceptions on ErrorResponse instead of returning them.

**Date Handling**: Backend stores ISO format strings with 'Z' suffix. Flight filtering supports both ISO format and YYYY-MM-DD. Frontend uses date-fns for formatting.

**Local Startup**: `deployment_scripts/local/start_locally.sh` requires Python 3.11, Node.js 18+, Maven, and Java 17+. Sets `JAVA_HOME` to `/opt/homebrew/opt/openjdk@17` on macOS. Kills existing processes on ports 8001, 5173, 8080 before starting.