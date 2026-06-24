# ADR-003: Abstract HTTP Client for Yuno API

## Status
Accepted

## Context
Calls to Yuno API were duplicated across multiple functions:
- Same headers being configured in each function
- Duplicated error handling
- Inconsistent logging

## Decision
Create `YunoClient` class that encapsulates:
- Default header configuration
- Automatic request/response logging
- Centralized error handling
- Convenient methods (get, post, put, delete)

```javascript
class YunoClient {
    getHeaders()           // Default headers
    request(options)       // Base method
    get(endpoint)          // GET wrapper
    post(endpoint, body)   // POST wrapper
}
```

### Usage
```javascript
// Before
const response = await fetch(`${API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
})

// After
const response = await yunoClient.post('/v1/payments', payment, {
    name: 'CREATE_PAYMENT'
})
```

## Alternatives Considered

### 1. Keep direct fetch
- Pros: No additional abstraction
- Cons: Duplicated code, hard to maintain

### 2. Use axios
- Pros: Interceptors, cancellation
- Cons: Additional dependency, native fetch is sufficient

### 3. Custom client (chosen)
- Pros: Full control, integrated logging
- Cons: More initial code

## Consequences

### Positive
- DRY code (Don't Repeat Yourself)
- Easy to change global configuration
- Automatic logging of all calls
- Consistent error handling

### Negative
- One additional layer of abstraction
- Needs to be updated if API changes significantly

---
Date: 2024-01-15
Authors: Development Team
