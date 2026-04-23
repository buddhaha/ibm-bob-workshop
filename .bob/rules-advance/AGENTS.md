# Advanced Mode Rules (Non-Obvious Only)

This file provides advanced coding-specific guidance discovered by reading the codebase.

## Backend Coding Patterns

- **Service layer returns Union types** - Functions in `services/` return `SuccessModel | ErrorResponse`, never raise exceptions (see `booking.py`)
- **MCP tools bypass dependency injection** - Use `SessionLocal()` directly and manually close sessions (see `server.py` lines 29-33)
- **Name verification is mandatory** - `book_flight()` validates BOTH `user_id` AND `name` match in DB (non-standard security, see `booking.py` line 50)
- **Seat class multipliers hardcoded** - `SEAT_CLASS_MULTIPLIERS` dict in `booking.py` (1.0x, 2.5x, 5.0x) - not configurable
- **Three independent seat counters** - Each flight has `economy_seats_available`, `business_seats_available`, `galaxium_seats_available` - decrement the correct one

## Frontend Coding Patterns

- **Error detection via field check** - Check `success: false` field in response, NOT HTTP status codes (see `api.ts` line 112)
- **Vite env vars** - Use `import.meta.env.VITE_API_URL`, NOT `process.env` (Vite-specific pattern)
- **Custom Tailwind colors** - Space-themed palette in `tailwind.config.js` (space-dark, cosmic-purple, nebula-pink, etc.) - not standard Tailwind

## Java Service Patterns

- **Python backend URL from config** - Java service uses `@Value("${python.backend.url}")` to call Python backend at `/internal/bookings/from-hold`
- **No direct frontend-to-Java** - All Java calls proxied through Python backend (architecture constraint)

## Testing Patterns

- **StaticPool required** - Tests MUST use `poolclass=StaticPool` for in-memory SQLite thread safety (see `conftest.py` line 21)
- **Double SessionLocal patch** - Must patch BOTH `db.SessionLocal` AND `server.SessionLocal` in tests (see `conftest.py` lines 49-50)
- **Seed disabled in tests** - `monkeypatch.setattr(server, "seed", lambda: None)` prevents data pollution (line 53)
- **Run single test** - Must cd to backend dir: `cd booking_system_backend && pytest tests/test_services.py::test_name -v`

## Access To
- MCP tools
- Browser tools