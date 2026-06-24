# ADR-001: Modular Architecture with Separation of Concerns

## Status
Accepted

## Context
The SDK Lite 1.5 project grew organically and accumulated all code in two main files (`server.js` and `yuno.js`). This made it difficult to:
- Maintain the code
- Write unit tests
- Add new features
- Onboard new developers

## Decision
Adopt a modular architecture following an adapted MVC pattern with:

```
src/
  config/       # Centralized configurations
  controllers/  # HTTP handlers (entry)
  services/     # Business logic
  routes/       # Route definitions
  middlewares/  # Express middlewares
  utils/        # Utilities (errors, logger)
  integrations/ # External API clients
```

### Data Flow
```
Request -> Routes -> Controllers -> Services -> Integrations -> Yuno API
                                                           <- Response
```

## Alternatives Considered

### 1. Keep current structure
- Pros: No changes needed
- Cons: Technical debt keeps growing

### 2. Organized monolith (chosen)
- Pros: Simple, adequate for project size
- Cons: May need to evolve to microservices later

### 3. Microservices
- Pros: Scalability, independent deploys
- Cons: Excessive complexity for current size

## Consequences

### Positive
- More testable code
- Clear separation of concerns
- Easy to add new payment methods
- Better development experience

### Negative
- More files to navigate
- Need for imports between modules

---
Date: 2024-01-15
Authors: Development Team
