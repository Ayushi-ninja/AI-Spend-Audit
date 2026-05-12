# Tests

All tests cover the audit engine — the core logic of the application.

## Running Tests

```bash
npm test
```

## Test Files

### `__tests__/auditEngine.test.ts`

| Test | What it covers |
|---|---|
| recommends downgrade from Cursor Business to Pro for 2 users | Cursor over-plan detection for small teams |
| recommends keep for well-configured Cursor Pro | No false positives on correct configurations |
| recommends downgrade from Claude Team to Pro for solo user | Claude seat-count mismatch detection |
| flags high API spend as credits-eligible | API spend threshold and credits recommendation |
| marks audit as alreadyOptimal when total savings under $100 | alreadyOptimal flag calculation |
| calculates correct annual savings | totalAnnualSavings = totalMonthlySavings × 12 |

## Running Specific Tests

```bash
# Run a single test by name
npm test -- --testNamePattern="recommends downgrade from Cursor"

# Run with coverage
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

## CI

Tests run automatically on every push to main via GitHub Actions.
See `.github/workflows/ci.yml`.