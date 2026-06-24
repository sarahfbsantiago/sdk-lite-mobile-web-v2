# ADR-002: Custom Error System

## Status
Accepted

## Context
Error handling was inconsistent:
- Some errors returned as `{ error: ... }`
- Others as `{ message: ... }`
- HTTP codes varied for similar errors
- Hard to distinguish operational errors from programming errors

## Decision
Implement custom error hierarchy:

```javascript
AppError (base)
  ├── ValidationError (400)
  ├── AuthenticationError (401)
  ├── AuthorizationError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  ├── PaymentError (400)
  ├── InvalidCheckoutSessionError (400)
  └── ExternalServiceError (502)
```

### Features
1. **isOperational**: Flag to distinguish expected errors from bugs
2. **toJSON()**: Consistent serialization
3. **Centralized middleware**: Single point of handling

## Alternatives Considered

### 1. Use native Error only
- Pros: Simple
- Cons: No metadata, inconsistent handling

### 2. External library (boom, http-errors)
- Pros: Ready solution
- Cons: Additional dependency, less control

### 3. Custom errors (chosen)
- Pros: Full control, no dependencies
- Cons: More code to maintain

## Consequences

### Positive
- Standardized error responses
- Easy to add new error types
- Structured error logging
- Better debugging

### Negative
- Learning curve to use correctly
- Need to keep hierarchy updated

---
Date: 2024-01-15
Authors: Development Team
