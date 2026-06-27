# Aegis Routing Engine Security Specification

## 1. Data Invariants
- **Identity Lock**: A user can only create, update, delete, get, or list request records where the `userId` field strictly matches their own authenticated Firebase `request.auth.uid`.
- **System-Only & Read-Only Constraints**:
  - Request records are write-once/immutable. No update or delete operations are permitted by any user, as they represent official telemetry logs of the optimization layer.
  - The `userId` and `timestamp` fields are immutable and verified using `request.time`.
- **Field Constraints**:
  - `originalPrompt` must be a valid non-empty string.
  - `estimatedTokens` must be a positive integer.
  - `semanticComplexityScore` must be an integer between 0 and 100.
  - `targetModelRouted` must be strictly either "Gemini Flash" or "Gemini Pro".
  - `executionLatencyMs` must be a positive integer.
  - `costSavedUSD` must be a floating point number.

---

## 2. The "Dirty Dozen" Payloads (Malicious/Violation Attempts)

### Payload 1: Identity Spoofing (Create request for another user ID)
```json
{
  "userId": "attacker_id_123",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 2: Missing Authentication (Create request as unauthenticated user)
```json
{
  "userId": "some_user",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 3: Unverified User Email (If email verification is mandated)
```json
{
  "userId": "unverified_user_id",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 4: Invalid Complexity Range High (Score > 100)
```json
{
  "userId": "valid_user_id",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 105,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 5: Invalid Complexity Range Low (Score < 0)
```json
{
  "userId": "valid_user_id",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": -5,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 6: Invalid Model Name (Incorrect target routing selection)
```json
{
  "userId": "valid_user_id",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 45,
  "targetModelRouted": "Gemini Ultra Premium",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 7: Update Existing Request (Telemetries are read-only)
Attempting to update an existing request log (e.g. altering the prompt or cost savings).
```json
{
  "costSavedUSD": 9999.99
}
```

### Payload 8: Delete Existing Request (Telemetry deletion is forbidden)
Attempting to delete a request document.

### Payload 9: Blanket Query / Scraping Attempt (Listing records of other users)
Attempting to query/list requests without filtering by `userId == request.auth.uid`.

### Payload 10: Toxic Input Payload (Over-sized prompt injection)
Attempting to inject a massive prompt to trigger Denial of Wallet.
```json
{
  "userId": "valid_user_id",
  "originalPrompt": "A".repeat(1000000),
  "estimatedTokens": 5,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 11: Spoofed Server Timestamp (Client trying to override timestamp)
```json
{
  "userId": "valid_user_id",
  "timestamp": "1990-01-01T00:00:00Z",
  "originalPrompt": "Hello",
  "estimatedTokens": 5,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

### Payload 12: Invalid Token Count (Negative estimated tokens)
```json
{
  "userId": "valid_user_id",
  "originalPrompt": "Hello",
  "estimatedTokens": -100,
  "semanticComplexityScore": 10,
  "targetModelRouted": "Gemini Flash",
  "executionLatencyMs": 150,
  "costSavedUSD": 0.0001
}
```

---

## 3. Test Definitions
The Security Rules must block all these attacks and guarantee permission denial.
