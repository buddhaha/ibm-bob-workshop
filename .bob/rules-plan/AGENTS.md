# Plan Mode Rules (Non-Obvious Only)

## Architectural Constraints
- **MCP lifespan must combine with FastAPI** - MCP server created before FastAPI app (see [`server.py`](../../booking_system_backend/server.py:20))
- **MCP tools bypass dependency injection** - Manually create/close DB sessions with `SessionLocal()` (see [`server.py`](../../booking_system_backend/server.py:29-33))
- **SQLite is production database** - No external DB; intentional for demo simplicity (see [`AGENTS.md`](../../AGENTS.md:15))
- **Data ephemeral by design** - Container filesystem storage, re-seeded on every ECS task start (see [`AGENTS.md`](../../AGENTS.md:16))

## Service Layer Patterns
- **Union return types, not exceptions** - Services return `SuccessModel | ErrorResponse` (see [`booking.py`](../../booking_system_backend/services/booking.py))
- **Name verification security pattern** - Bookings validate both user_id AND name match (non-standard approach)
- **Independent seat class tracking** - Each class (economy/business/galaxium) has separate availability counters

## Integration Architecture
- **Python backend proxies Java service** - No direct frontend-to-Java communication (see [`inventory_hold_service/README.md`](../../inventory_hold_service/README.md:22-25))
- **Java service calls back to Python** - Circular dependency for booking confirmation
- **Three-service architecture** - Python (8001), React (5173), Java (8080) all required

## Testing Architecture
- **In-memory SQLite with StaticPool** - Thread safety requirement for tests (see [`conftest.py`](../../booking_system_backend/tests/conftest.py:21))
- **Double monkeypatch required** - Must patch both `db.SessionLocal` and `server.SessionLocal` (see [`conftest.py`](../../booking_system_backend/tests/conftest.py:49-50))

## Deployment Patterns
- **Scripts organized by target** - All in [`deployment_scripts/`](../../deployment_scripts/) (aws/, ibm/, local/)
- **Root start.sh is wrapper** - Calls actual script in [`deployment_scripts/local/`](../../deployment_scripts/local/)