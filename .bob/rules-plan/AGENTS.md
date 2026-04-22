# Plan Mode Rules (Non-Obvious Only)

## Architectural Constraints

**Service Coupling**: Python backend proxies Java hold service endpoints. Proxy returns `{"error": "..."}` with HTTP 200 (not error status) when Java unavailable - frontend must check manually with assertNotProxyError(). Java calls Python's /internal/bookings/from-hold which returns HTTP 400 on failure.

**Seat Class Independence**: Three separate seat counters per flight (economy/business/galaxium) with 60%/30%/10% distribution. Booking/cancellation MUST update the specific counter based on seat_class field. No generic "seats_available" field exists. Price multipliers: 1.0x/2.5x/5.0x.

**Database Seeding Constraint**: Seed only runs if users table is empty to avoid wiping registered users. This means seed data and user registrations cannot coexist - seed skips entirely if any users exist.

**MCP Lifespan Dependency**: MCP server MUST be created before FastAPI app (line 22 in server.py) to properly combine lifespans. This is a hard requirement, not a preference. Reversing order breaks MCP integration.

**Error Propagation Pattern**: Services return Union[SuccessType, ErrorResponse] instead of raising exceptions. Callers must check isinstance(result, ErrorResponse). MCP tools are exception-based - they raise on ErrorResponse instead of returning it.

**Authentication Limitation**: No password system exists. Name+email combination is the only authentication. Both must match for user lookup. Frontend stores user in localStorage ('galaxium_user'). This limits multi-user scenarios on shared devices.

**Database Flexibility**: Backend supports SQLite (local) or PostgreSQL (production) via DATABASE_URL env var. Schema is identical but connection handling differs (check_same_thread for SQLite only).

**Date Format Duality**: Backend stores ISO strings with 'Z' suffix but flight filtering accepts both ISO format and YYYY-MM-DD. This dual support is intentional for API flexibility but creates inconsistency.

**Hold Confirmation Flow**: Java HoldService creates hold locally, then calls Python backend to create booking. Booking ID stored as externalBookingReference in Hold entity. If Python booking fails, hold status becomes CONFIRMATION_FAILED (not rolled back).

**Testing Directory Requirement**: Backend tests must run from booking_system_backend/ directory. Pytest config (pytest.ini) sets testpaths=tests which is relative to that directory.