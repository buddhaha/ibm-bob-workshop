# Plan Mode Rules (Non-Obvious Only)

This file provides architectural constraints discovered by reading the codebase.

## Critical Architecture Constraints

- **MCP server MUST precede FastAPI app** - `server.py` line 16-22 - MCP lifespan must be combined with FastAPI lifespan (initialization order matters)
- **Service layer never raises exceptions** - Returns `Union[SuccessModel, ErrorResponse]` instead (see `booking.py`) - architectural decision for error handling
- **Three separate data stores** - Python SQLite, Java SQLite, frontend localStorage - intentionally not shared (demo isolation)
- **No direct frontend-to-Java calls** - All Java service calls proxied through Python backend (integration pattern constraint)

## Hidden Coupling

- **MCP tools manually manage DB sessions** - Use `SessionLocal()` directly, bypassing FastAPI dependency injection (see `server.py` lines 29-33)
- **Name verification couples user and booking** - `book_flight()` validates BOTH `user_id` AND `name` match (non-standard security pattern in `booking.py` line 50)
- **Seat counters are independent** - Three separate fields per flight (`economy_seats_available`, `business_seats_available`, `galaxium_seats_available`) - not a single counter

## Non-Standard Patterns

- **SQLite is the production database** - Intentional for demo; `DATABASE_URL` env var unset in ECS so `db.py` defaults to SQLite (lines 7-9)
- **Ephemeral data by design** - SQLite on container filesystem; re-seeds on every ECS task start via `SEED_DEMO_DATA=true`
- **Error detection via response field** - Frontend checks `success: false` field, NOT HTTP status codes (see `api.ts` line 112)

## Testing Architecture

- **StaticPool required for thread safety** - In-memory SQLite tests MUST use `poolclass=StaticPool` (see `conftest.py` line 21)
- **Double SessionLocal patching** - Tests must patch BOTH `db.SessionLocal` AND `server.SessionLocal` (lines 49-50)
- **Seed function disabled in tests** - Explicitly patched to prevent data pollution (line 53)

## Deployment Constraints

- **Scripts must run from specific directories** - Backend tests: `cd booking_system_backend && pytest` (not from root)
- **start.sh is a wrapper** - Root script delegates to `deployment_scripts/local/start_locally.sh` (backward compatibility)
- **Three deployment targets** - AWS (ECS), IBM Cloud (Code Engine), Local (Docker Compose) - each with separate scripts in `deployment_scripts/`