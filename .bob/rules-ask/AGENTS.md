# Ask Mode Rules (Non-Obvious Only)

## Architecture Context

**Multi-Service Setup**: Three services run independently - Python backend (8001), Java hold service (8080), frontend (5173). Python proxies Java endpoints but returns `{"error": "..."}` with HTTP 200 on Java unavailability.

**Database Duality**: Backend supports both SQLite (local dev) and PostgreSQL (production) via DATABASE_URL env var. Seed data auto-loads if SEED_DEMO_DATA=true and users table is empty.

**Authentication Model**: No passwords exist. System uses name+email combination for user identification. Frontend persists user in localStorage with key 'galaxium_user'. Both name AND email must match for backend validation.

**Seat Class Architecture**: Each flight has THREE independent seat counters (economy_seats_available, business_seats_available, galaxium_seats_available) with 60%/30%/10% distribution. Booking/cancellation updates the specific counter, not a generic counter.

**Error Response Pattern**: Services return Union[SuccessType, ErrorResponse]. ErrorResponse always has success=false, error, error_code, and optional details. Frontend has isErrorResponse() helper, backend uses isinstance() check.

**Java-Python Integration**: Java HoldService calls Python's /internal/bookings/from-hold endpoint. Python returns HTTP 400 on booking failure (not 200 with error object) so Java can detect failures. Hold stores booking_id as externalBookingReference.

**MCP Integration**: FastMCP provides tools for AI agents. Each tool creates its own DB session with try/finally cleanup. Tools raise exceptions on ErrorResponse instead of returning them. MCP server MUST be created before FastAPI app (line 22 in server.py).

**Date Storage**: Backend stores ISO format strings with 'Z' suffix. Flight filtering accepts both full ISO format and simple YYYY-MM-DD format. Frontend uses date-fns for display formatting.

**Local Development**: start_locally.sh requires Python 3.11, Node.js 18+, Maven, Java 17+. Script sets JAVA_HOME to /opt/homebrew/opt/openjdk@17 on macOS. Kills processes on ports 8001, 5173, 8080 before starting.