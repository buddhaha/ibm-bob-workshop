# Advanced Mode Rules (Non-Obvious Only)

## Backend Coding Patterns
- **Service functions return Union types** - Return `SuccessModel | ErrorResponse`, never raise exceptions (see [`booking.py`](../../booking_system_backend/services/booking.py))
- **MCP tools manually manage DB sessions** - Use `SessionLocal()` directly, then `db.close()` in finally block (see [`server.py`](../../booking_system_backend/server.py:29-33))
- **Name verification required for bookings** - [`book_flight()`](../../booking_system_backend/services/booking.py:15) validates both `user_id` AND `name` match (non-standard security)
- **Seat class validation** - Must check against `SEAT_CLASS_MULTIPLIERS` dict keys before processing (see [`booking.py`](../../booking_system_backend/services/booking.py:8-12))

## Frontend Coding Patterns
- **Error responses check `success` field** - Don't rely on HTTP status codes, check `success: false` in response body (see [`api.ts`](../../booking_system_frontend/src/services/api.ts:112))
- **API URL from Vite env** - Use `import.meta.env.VITE_API_URL`, NOT `process.env` (Vite-specific pattern)
- **Custom Tailwind colors** - Space-themed palette in [`tailwind.config.js`](../../booking_system_frontend/tailwind.config.js:9-16), not standard Tailwind

## Testing Patterns
- **Monkeypatch both SessionLocal imports** - Must patch `db.SessionLocal` AND `server.SessionLocal` (see [`conftest.py`](../../booking_system_backend/tests/conftest.py:49-50))
- **Seed function disabled in tests** - Explicitly patched to prevent data pollution (see [`conftest.py`](../../booking_system_backend/tests/conftest.py:53))
- **Run single test**: `cd booking_system_backend && pytest tests/test_services.py::test_name -v`

## Commands
- **Backend tests must run from backend dir**: `cd booking_system_backend && pytest`
- **Frontend dev**: `cd booking_system_frontend && npm run dev`

## MCP & Browser Tools
- Full access to MCP servers (context7 for documentation)
- Browser automation available via Puppeteer
- Use for web testing, documentation lookup, external API integration