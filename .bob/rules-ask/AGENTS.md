# Ask Mode Rules (Non-Obvious Only)

This file provides documentation context discovered by reading the codebase.

## Project Structure (Counterintuitive)

- **Demo system, not production** - Explicitly stated in AGENTS.md line 3 - showcases enterprise patterns for AI-native IDE demos
- **SQLite is intentional** - No external DB; `DATABASE_URL` env var unset in ECS so `db.py` defaults to SQLite (line 7-9)
- **Ephemeral data by design** - SQLite on container filesystem; demo data re-seeds on every ECS task start via `SEED_DEMO_DATA=true`
- **start.sh is a wrapper** - Root `start.sh` just calls `deployment_scripts/local/start_locally.sh` (backward compatibility)

## Architecture (Hidden Patterns)

- **MCP server created before FastAPI** - Line 16 in `server.py` - MCP lifespan must be combined with FastAPI lifespan (critical ordering)
- **Java service never called directly** - Frontend → Python Backend → Java Hold Service (no direct frontend-to-Java)
- **Three separate databases** - Python backend SQLite, Java service SQLite, and frontend localStorage for holds (not shared)

## Documentation Organization

- **Main docs in README.md** - Lines 297-397 contain consolidated implementation ideas (future features, not current)
- **AGENTS.md is the source of truth** - Critical non-obvious patterns for AI agents (this is what you're reading)
- **Component READMEs** - Each service has its own README with API details (backend, frontend, Java service)
- **Deployment scripts organized by target** - `deployment_scripts/aws/`, `deployment_scripts/ibm/`, `deployment_scripts/local/`

## Testing Context

- **Backend tests must run from backend dir** - `cd booking_system_backend && pytest` (not from root)
- **In-memory SQLite for tests** - Uses `:memory:` with StaticPool (see `conftest.py`)
- **No frontend unit tests** - Only build tests via `npm run build`

## Naming Conventions (Non-Standard)

- **"Galaxium" is the premium class** - Not "First Class" - space-themed naming (Economy, Business, Galaxium)
- **"Hold service" not "reservation service"** - Java service manages temporary holds, not reservations
- **"MCP" is Model Context Protocol** - For AI agent integration, not a standard REST API