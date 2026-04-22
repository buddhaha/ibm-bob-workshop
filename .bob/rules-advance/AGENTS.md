# Advance Mode Rules (Non-Obvious Only)

## Critical Patterns

**Seat Class Updates**: When booking/cancelling, MUST update the specific seat counter (economy_seats_available, business_seats_available, or galaxium_seats_available) based on booking.seat_class field. Never update a generic "seats_available" field.

**Service Layer Returns**: All service functions return `Union[SuccessType, ErrorResponse]`. Always check `isinstance(result, ErrorResponse)` before using result. ErrorResponse has `success=false`, `error`, `error_code`, `details`.

**User Validation**: Backend requires BOTH name AND email to match for user operations. Frontend stores user in localStorage as `'galaxium_user'`. No password validation exists.

**Database Sessions**: MCP tools create their own SessionLocal() with try/finally cleanup. REST endpoints use Depends(get_db) for session management. Never mix these patterns.

**Price Calculation**: Use SEAT_CLASS_MULTIPLIERS dict in services/booking.py (economy=1.0, business=2.5, galaxium=5.0). Store calculated price in booking.price_paid field.

**Date Format**: Backend stores ISO strings with 'Z' suffix. Flight filtering accepts both ISO format and YYYY-MM-DD. Use datetime.utcnow().isoformat() for new timestamps.

**Frontend Error Checking**: Java service proxy endpoints return `{"error": "..."}` with HTTP 200 on failure. Must call `assertNotProxyError()` helper before using response data.

**MCP Server Order**: In server.py, MCP server (line 22) MUST be created before FastAPI app to properly combine lifespans. This is not optional.

## Access To

- MCP tools (via context7 server)
- Browser automation