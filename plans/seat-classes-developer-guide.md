# Seat Classes Developer Guide

## Quick Reference

This guide provides technical details for developers working with the Galaxium Travels seat class system.

## Seat Class Constants

### Backend (Python)
```python
# Location: booking_system_backend/services/booking.py
SEAT_CLASS_MULTIPLIERS = {
    'economy': 1.0,
    'business': 2.5,
    'galaxium': 5.0
}
```

### Frontend (TypeScript)
```typescript
// Location: booking_system_frontend/src/types/index.ts
export type SeatClass = 'economy' | 'business' | 'galaxium';
```

### Java Service
```java
// Location: inventory_hold_service/.../PricingService.java
// Note: Uses "first" instead of "galaxium"
private static final Map<String, Long> BASE_PRICES = Map.of(
    "economy", 500000L,
    "business", 2500000L,
    "first", 5000000L
);
```

## Database Schema

### Flight Table
```sql
CREATE TABLE flights (
    flight_id INTEGER PRIMARY KEY,
    origin VARCHAR NOT NULL,
    destination VARCHAR NOT NULL,
    departure_time VARCHAR NOT NULL,
    arrival_time VARCHAR NOT NULL,
    base_price INTEGER NOT NULL,  -- Economy price (1x multiplier)
    economy_seats_available INTEGER NOT NULL,   -- 60% of total
    business_seats_available INTEGER NOT NULL,  -- 30% of total
    galaxium_seats_available INTEGER NOT NULL   -- 10% of total
);
```

### Booking Table
```sql
CREATE TABLE bookings (
    booking_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    flight_id INTEGER NOT NULL,
    status VARCHAR NOT NULL,
    booking_time VARCHAR NOT NULL,
    seat_class VARCHAR NOT NULL DEFAULT 'economy',  -- economy/business/galaxium
    price_paid INTEGER NOT NULL  -- Actual price at booking time
);
```

## API Endpoints

### List Flights with Seat Class Filtering
```http
GET /flights?has_economy=true&has_business=true&has_galaxium=true
GET /flights?seat_class=business
```

**Response**:
```json
{
  "flight_id": 1,
  "origin": "Earth",
  "destination": "Mars",
  "base_price": 1000000,
  "economy_seats_available": 6,
  "business_seats_available": 3,
  "galaxium_seats_available": 1,
  "economy_price": 1000000,
  "business_price": 2500000,
  "galaxium_price": 5000000
}
```

### Create Booking with Seat Class
```http
POST /bookings
Content-Type: application/json

{
  "user_id": 1,
  "name": "Alice",
  "flight_id": 1,
  "seat_class": "business"
}
```

**Response**:
```json
{
  "booking_id": 42,
  "user_id": 1,
  "flight_id": 1,
  "status": "booked",
  "booking_time": "2099-01-01T12:00:00Z",
  "seat_class": "business",
  "price_paid": 2500000
}
```

## Critical Business Rules

### 1. Independent Seat Counters
**Rule**: Each seat class has its own counter. Booking/cancellation MUST update the correct counter.

```python
# ✅ CORRECT
if seat_class == 'economy':
    flight.economy_seats_available -= 1
elif seat_class == 'business':
    flight.business_seats_available -= 1
else:  # galaxium
    flight.galaxium_seats_available -= 1

# ❌ WRONG - Do not use generic counter
flight.seats_available -= 1  # This field doesn't exist!
```

### 2. Price Calculation
**Rule**: Price is calculated at booking time and stored in `price_paid`.

```python
# ✅ CORRECT
price_paid = int(flight.base_price * SEAT_CLASS_MULTIPLIERS[seat_class])
booking.price_paid = price_paid

# ❌ WRONG - Do not recalculate from base_price later
# Prices may change, historical bookings must preserve original price
```

### 3. Seat Class Validation
**Rule**: Always validate seat class before processing.

```python
# ✅ CORRECT
if seat_class not in SEAT_CLASS_MULTIPLIERS:
    return ErrorResponse(
        error="Invalid seat class",
        error_code="INVALID_SEAT_CLASS"
    )

# ❌ WRONG - Assuming valid input
price = flight.base_price * SEAT_CLASS_MULTIPLIERS[seat_class]  # KeyError!
```

### 4. Cancellation Restoration
**Rule**: Restore seat to the SAME class it was booked in.

```python
# ✅ CORRECT
if booking.seat_class == 'economy':
    flight.economy_seats_available += 1
elif booking.seat_class == 'business':
    flight.business_seats_available += 1
elif booking.seat_class == 'galaxium':
    flight.galaxium_seats_available += 1

# ❌ WRONG - Restoring to wrong class
flight.economy_seats_available += 1  # Always restores to economy!
```

## Frontend Components

### Flight Card Display
```typescript
// Location: booking_system_frontend/src/components/flights/FlightCard.tsx

const seatClasses = [
  {
    name: 'Economy',
    class: 'economy' as SeatClass,
    price: flight.economy_price,
    seats: flight.economy_seats_available,
    icon: Plane,
    color: 'text-blue-400',
  },
  // ... business and galaxium
];
```

### Booking Modal Flow
```typescript
// Location: booking_system_frontend/src/components/bookings/BookingModal.tsx

// Step 1: User selects seat class
const [selectedClass, setSelectedClass] = useState<SeatClass>('economy');

// Step 2: Get quote from Java service
const quote = await createQuote({
  flightId: flight.flight_id,
  seatClass: selectedClass,
  quantity: 1,
  travelerId: user.user_id,
  travelerName: user.name,
});

// Step 3: Place hold (15 minutes)
const hold = await createHold(quote.quoteId);

// Step 4: Confirm booking (calls Python backend)
const confirmed = await confirmHold(hold.holdId);
```

## Testing Patterns

### Backend Service Tests
```python
# Location: booking_system_backend/tests/test_services.py

def test_book_flight_business_class(db_session):
    """Test booking a business class seat."""
    # Arrange
    flight = create_test_flight(db_session)
    user = create_test_user(db_session)
    initial_business = flight.business_seats_available
    
    # Act
    result = book_flight(
        db_session, 
        user.user_id, 
        user.name, 
        flight.flight_id,
        seat_class='business'
    )
    
    # Assert
    assert isinstance(result, BookingOut)
    assert result.seat_class == 'business'
    assert result.price_paid == flight.base_price * 2.5
    
    db_session.refresh(flight)
    assert flight.business_seats_available == initial_business - 1
    assert flight.economy_seats_available == initial_economy  # Unchanged
```

### Frontend Component Tests
```typescript
// Test seat class selection
it('should allow selecting different seat classes', () => {
  render(<BookingModal flight={mockFlight} />);
  
  const businessButton = screen.getByText('Business');
  fireEvent.click(businessButton);
  
  expect(businessButton).toHaveClass('border-purple-500');
});

// Test sold-out handling
it('should disable sold-out seat classes', () => {
  const soldOutFlight = {
    ...mockFlight,
    business_seats_available: 0
  };
  
  render(<BookingModal flight={soldOutFlight} />);
  
  const businessButton = screen.getByText('Business');
  expect(businessButton).toBeDisabled();
});
```

## Common Pitfalls

### ❌ Pitfall 1: Using Generic Seat Counter
```python
# WRONG - No generic counter exists
if flight.seats_available < 1:
    return error
```

**Solution**: Check the specific class counter
```python
# CORRECT
if seat_class == 'economy':
    seats_available = flight.economy_seats_available
elif seat_class == 'business':
    seats_available = flight.business_seats_available
else:
    seats_available = flight.galaxium_seats_available

if seats_available < 1:
    return error
```

### ❌ Pitfall 2: Hardcoding Prices
```python
# WRONG - Prices may change
if seat_class == 'business':
    price = 2500000
```

**Solution**: Calculate from base_price
```python
# CORRECT
price = int(flight.base_price * SEAT_CLASS_MULTIPLIERS[seat_class])
```

### ❌ Pitfall 3: Forgetting to Update Counters
```python
# WRONG - Booking created but seats not decremented
booking = Booking(...)
db.add(booking)
db.commit()
```

**Solution**: Always update the counter
```python
# CORRECT
booking = Booking(...)
if seat_class == 'economy':
    flight.economy_seats_available -= 1
# ... handle other classes
db.add(booking)
db.commit()
```

### ❌ Pitfall 4: Java Service Naming Mismatch
```typescript
// WRONG - Java uses "first" not "galaxium"
const quote = await createQuote({
  seatClass: 'galaxium'  // Java won't recognize this
});
```

**Solution**: Python backend handles the translation
```typescript
// CORRECT - Let Python backend proxy handle it
// Frontend uses 'galaxium', Python translates for Java if needed
const quote = await createQuote({
  seatClass: 'galaxium'  // Python backend handles Java integration
});
```

## Performance Considerations

### Database Queries
- Use indexes on `seat_class` field for filtering
- Consider materialized views for seat availability aggregations
- Cache flight data with seat counts for read-heavy operations

### Concurrent Bookings
- Database transactions ensure atomic counter updates
- Row-level locking prevents race conditions
- Hold system provides 15-minute reservation window

## Monitoring & Alerts

### Key Metrics to Track
1. **Booking rate by class** - Identify popular classes
2. **Seat utilization** - Monitor fill rates per class
3. **Price sensitivity** - Track conversion by price point
4. **Cancellation patterns** - Class-specific cancellation rates

### Alert Thresholds
- Low seat availability (< 3 seats in any class)
- Unusual booking patterns (sudden spike/drop)
- Failed bookings due to sold-out classes
- Price calculation errors

## Migration Guide

### Adding a New Seat Class
If you need to add a fourth class (e.g., "premium-economy"):

1. **Update Backend Constants**
```python
SEAT_CLASS_MULTIPLIERS = {
    'economy': 1.0,
    'premium-economy': 1.5,  # New class
    'business': 2.5,
    'galaxium': 5.0
}
```

2. **Add Database Column**
```sql
ALTER TABLE flights ADD COLUMN premium_economy_seats_available INTEGER DEFAULT 0;
```

3. **Update Type Definitions**
```typescript
export type SeatClass = 'economy' | 'premium-economy' | 'business' | 'galaxium';
```

4. **Update UI Components**
- Add to `seatClasses` array in FlightCard
- Add icon and color scheme
- Update feature lists

5. **Update Tests**
- Add test cases for new class
- Verify counter management
- Test price calculations

## Resources

- **Backend Code**: [`booking_system_backend/`](../booking_system_backend/)
- **Frontend Code**: [`booking_system_frontend/`](../booking_system_frontend/)
- **Java Service**: [`inventory_hold_service/`](../inventory_hold_service/)
- **Tests**: [`booking_system_backend/tests/`](../booking_system_backend/tests/)
- **Architecture**: [`AGENTS.md`](../AGENTS.md)

## Support

For questions or issues:
1. Check existing tests for usage examples
2. Review AGENTS.md for architectural patterns
3. Consult this guide for common pitfalls
4. Run test suite to verify changes

---

**Last Updated**: 2026-04-22  
**Version**: 1.0  
**Status**: Production-Ready