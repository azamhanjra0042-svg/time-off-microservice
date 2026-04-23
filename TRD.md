# Technical Requirements Document (TRD)
## Time-Off Microservice

## 1. Overview
This microservice manages time-off requests and balance projections for employees. The Human Capital Management (HCM) system remains the source of truth for employment and leave balances, while this service provides fast, local request lifecycle handling and balance visibility.

The service is built with NestJS and SQLite.

## 2. Problem Statement
Employees need immediate feedback when requesting time off, and managers need confidence that approvals are based on valid balance data. However, HCM is not the only system that changes balances. Balances may also change because of work anniversaries, annual refreshes, or other external actions. This creates consistency challenges between the local system and HCM.

The backend must:
- create and manage time-off requests
- maintain a local balance projection
- stay synchronized with HCM realtime updates
- ingest HCM batch balance corpuses
- remain defensive when HCM validation is incomplete or delayed

## 3. Goals
- Provide accurate projected balances to employees
- Support the full request lifecycle: create, approve, reject, cancel
- Preserve integrity between HCM state and local projection
- Support both realtime and batch HCM sync paths
- Prevent regressions with a strong test strategy
- Support idempotent request creation

## 4. Non-Goals
- Payroll processing
- Multi-tenant sharding
- UI implementation
- Complex accrual policy engines
- Production-grade distributed event bus

## 5. Core Domain Model

### 5.1 TimeOffRequest
Represents a request initiated by an employee.

Fields:
- id
- employeeId
- locationId
- amount
- startDate
- endDate
- reason
- status
- failureReason
- idempotencyKey
- externalReference

### 5.2 BalanceProjection
Represents the locally cached and derived balance state.

Fields:
- employeeId
- locationId
- hcmBalanceAmount
- pendingRequestAmount
- approvedUnsettledAmount
- projectedAvailableAmount
- syncStatus
- lastRealtimeSyncAt
- lastBatchSyncAt
- version

### 5.3 RequestEvent
Represents audit history for request lifecycle changes.

Fields:
- requestId
- eventType
- fromStatus
- toStatus
- payload
- createdAt

## 6. Request Lifecycle

### 6.1 Create Request
1. Client sends a create request with idempotency key.
2. Service checks whether the same idempotency key already exists.
3. Service validates dimensions and available balance through HCM.
4. If validation fails:
   - request saved as `FAILED_VALIDATION`
   - failure reason recorded
5. If validation succeeds:
   - request saved as `PENDING_APPROVAL`
   - current HCM balance pulled
   - local projection refreshed from realtime source
   - pending amount reserved locally
6. Audit event recorded.

### 6.2 Approve Request
1. Only `PENDING_APPROVAL` requests can be approved.
2. Service sends commit request to HCM.
3. If HCM commit fails:
   - request moves to `FAILED_VALIDATION`
   - pending amount is released
4. If HCM commit succeeds:
   - request moves to `APPROVED`
   - pending amount moves to approved-unsettled tracking
   - latest HCM balance pulled
   - local projection refreshed
5. Audit event recorded.

### 6.3 Reject Request
1. Only `PENDING_APPROVAL` requests can be rejected.
2. Pending amount is released.
3. Request moves to `REJECTED`.
4. Audit event recorded.

### 6.4 Cancel Request
1. Only `PENDING_APPROVAL` and `APPROVED` requests can be cancelled.
2. If request is pending:
   - release pending amount
3. If request is approved:
   - cancel in HCM
   - reduce approved-unsettled amount
   - refresh HCM balance locally
4. Request moves to `CANCELLED`.
5. Audit event recorded.

## 7. Balance Projection Rules

### 7.1 Realtime Sync
Used when HCM returns the latest balance during validation/approval/cancel operations.

Effects:
- updates `hcmBalanceAmount`
- updates `lastRealtimeSyncAt`
- recalculates projected balance
- marks projection as fresh

### 7.2 Batch Sync
Used when HCM sends the full balance corpus.

Effects:
- upserts local projection rows
- updates `lastBatchSyncAt`
- recalculates projected balance
- marks projection as fresh

### 7.3 Projection Formula
The projected available balance is defined as:

`projectedAvailableAmount = hcmBalanceAmount - pendingRequestAmount`

Approved unsettled amounts are tracked for lifecycle visibility but are not deducted again once HCM has already committed the balance reduction.

## 8. API Surface

### 8.1 Balance APIs
- `GET /balances/:employeeId/:locationId`
- `POST /balances/sync/realtime`

### 8.2 Batch Sync API
- `POST /sync/balances/batch`

### 8.3 Time-Off Request APIs
- `POST /time-off-requests`
- `GET /time-off-requests/:id`
- `POST /time-off-requests/:id/approve`
- `POST /time-off-requests/:id/reject`
- `POST /time-off-requests/:id/cancel`

### 8.4 Mock HCM APIs
- `GET /mock-hcm/balances/:employeeId/:locationId`
- `POST /mock-hcm/time-off/validate`
- `POST /mock-hcm/time-off/commit`
- `POST /mock-hcm/time-off/cancel`
- `POST /mock-hcm/batch/balances`
- `POST /mock-hcm/test-controls/set-balance`

## 9. Consistency Strategy
The system uses HCM as the source of truth, but maintains a local balance projection for responsiveness.

Approach:
- validate against HCM before request enters active flow
- refresh local balance after important HCM mutations
- support both batch and realtime sync paths
- use local projection for fast balance visibility
- store audit history for traceability

This is effectively a projection-based consistency model with defensive synchronization.

## 10. Idempotency Strategy
Create request endpoint requires an `idempotency-key` header.

Behavior:
- if the key is missing, reject request
- if the key already exists, return previously created request
- prevents accidental duplicate submission and duplicate local reservations

## 11. Error Handling
The service must:
- reject invalid lifecycle transitions with 400
- reject missing idempotency key with 400
- return 404 for missing requests
- save validation failures explicitly with failure reason
- remain defensive even if HCM does not perfectly guard every invalid case

## 12. Alternatives Considered

### Alternative A: Query HCM for every read
Pros:
- always freshest source
- simplest consistency model

Cons:
- poor latency
- weak user experience
- unnecessary HCM coupling
- brittle under outages

Decision:
Rejected. Local projection is necessary for responsiveness.

### Alternative B: Event-driven async-only architecture
Pros:
- scalable
- naturally decoupled

Cons:
- more infrastructure complexity
- harder local debugging for take-home scope
- eventual consistency harder to reason about in a small exercise

Decision:
Rejected for this implementation scope. Could be adopted later.

### Alternative C: Only one sync method
Pros:
- simpler implementation

Cons:
- does not satisfy problem constraints
- cannot absorb both realtime and corpus updates

Decision:
Rejected. Both realtime and batch sync are required.

## 13. Risks and Mitigations

### Risk 1: Divergence between HCM and local projection
Mitigation:
- realtime refresh after mutation
- batch sync support
- explicit sync metadata fields

### Risk 2: Duplicate request submission
Mitigation:
- idempotency key enforcement

### Risk 3: Invalid approval/rejection/cancel transitions
Mitigation:
- strict lifecycle guards

### Risk 4: Projection math bugs
Mitigation:
- explicit formula tests
- scenario-based e2e coverage

### Risk 5: HCM validation inconsistencies
Mitigation:
- defensive local handling
- failure state capture
- audit logging

## 14. Testing Strategy
Testing is split into:
- unit tests for services and projection math
- integration tests for SQLite/module interaction
- end-to-end tests for full HTTP workflows

See `TEST_PLAN.md` for full detail.

## 15. Future Improvements
- optimistic locking using version checks
- outbox/event publishing for downstream systems
- recurring accrual support
- manager authorization rules
- pagination/filtering for request history
- metrics and observability
- dead-letter handling for failed sync ingestion

## 16. Conclusion
This design balances correctness, simplicity, and responsiveness. It preserves HCM as the source of truth while maintaining a local projection to support fast request handling and accurate user feedback. The architecture is intentionally compact for a take-home exercise but leaves room for production-oriented evolution.