# API Layer

This directory contains all API-related code for the crypto wallet monitor frontend. The API layer is organized to provide clean, type-safe methods for communicating with the backend.

## Structure

- `types.ts` - Centralized TypeScript interfaces for all API responses and requests
- `wallet.ts` - Wallet-related API methods (monitoring addresses, adding/removing wallets)
- `test.ts` - Test-related API methods (balance checking, etc.)
- `index.ts` - Main export file that re-exports all API methods and types

## Usage

### Importing API Methods

```typescript
// Import specific methods
import { fetchMonitoredAddresses, addWalletToMonitoring } from '../api';

// Import types
import type { MonitoredAddress, BalanceResponse } from '../api';
```

### Available API Methods

#### Wallet Operations
- `fetchMonitoredAddresses()` - Get all monitored addresses for the current user
- `addWalletToMonitoring(address: string)` - Add a new wallet address to monitoring
- `removeWalletFromMonitoring(address: string)` - Remove a wallet address from monitoring

#### Test Operations
- `getTestBalance()` - Get test balance for the current user

### Type Safety

All API methods are fully typed with TypeScript interfaces defined in `types.ts`. This ensures:
- Compile-time type checking
- Better IDE support with autocomplete
- Clear documentation of expected request/response shapes

### Error Handling

All API methods use the authenticated API client which automatically:
- Adds authentication headers
- Handles base URL configuration
- Provides consistent error handling

Components should wrap API calls in try-catch blocks to handle errors appropriately. 