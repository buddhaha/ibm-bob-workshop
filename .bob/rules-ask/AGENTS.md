# Ask Mode Rules (Non-Obvious Only)

## Documentation Context
- **Demo system disclaimer** - This mimics enterprise challenges but is NOT production (see [`AGENTS.md`](../../AGENTS.md:3-4))
- **Deployment scripts moved** - All scripts now in [`deployment_scripts/`](../../deployment_scripts/) organized by target (aws/, ibm/, local/)
- **Start script is wrapper** - [`start.sh`](../../start.sh) in root just calls [`deployment_scripts/local/start_locally.sh`](../../deployment_scripts/local/start_locally.sh)
- **Three separate services** - Python backend (port 8001), React frontend (port 5173), Java hold service (port 8080)

## Architecture Context
- **MCP server created before FastAPI** - Lifespan combination requirement (see [`server.py`](../../booking_system_backend/server.py:20))
- **SQLite is production DB** - No external DB; `DATABASE_URL` intentionally unset in ECS (see [`db.py`](../../booking_system_backend/db.py:7-9))
- **Data ephemeral in ECS** - SQLite on container filesystem, re-seeded on task start via `SEED_DEMO_DATA=true`
- **Python backend proxies Java** - No direct frontend-to-Java communication (see [`inventory_hold_service/README.md`](../../inventory_hold_service/README.md:22-25))

## Testing Context
- **In-memory SQLite with StaticPool** - Required for thread safety (see [`conftest.py`](../../booking_system_backend/tests/conftest.py:21))
- **Tests must run from backend dir** - `cd booking_system_backend && pytest` (not from root)

## Non-Standard Patterns
- **Name verification for bookings** - Validates both user_id AND name (unusual security pattern)
- **Service functions return Union types** - Return success OR ErrorResponse, not exceptions
- **Error responses use `success` field** - Check `success: false` field via [`isErrorResponse`](../../booking_system_frontend/src/services/api.ts:211), not HTTP status codes