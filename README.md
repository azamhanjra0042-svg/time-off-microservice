# Time-Off Microservice

A NestJS + SQLite microservice for managing time-off requests while keeping local balance projections synchronized with an HCM source of truth.

## Overview

This service supports:

- local balance projection per employee per location
- realtime sync from HCM
- batch corpus sync from HCM
- time-off request lifecycle management
- idempotent request creation
- audit event tracking
- mock HCM endpoints for testing

The design keeps HCM as the source of truth while maintaining a local projection for fast feedback and request handling.

## Tech Stack

- NestJS
- TypeORM
- SQLite
- TypeScript

## Core Features

### Balance Projection
Tracks local balance state with:

- `hcmBalanceAmount`
- `pendingRequestAmount`
- `approvedUnsettledAmount`
- `projectedAvailableAmount`
- sync metadata fields

### Sync Paths
Two synchronization modes are supported:

- **Realtime sync** for mutation-related refreshes
- **Batch sync** for full corpus imports from HCM

### Request Lifecycle
Supported request states include:

- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `FAILED_VALIDATION`

### Idempotency
Create request requires an `idempotency-key` header to prevent duplicate submissions.

### Audit Trail
All major lifecycle transitions are logged into request events.

## Project Structure

```text
src/
  audit/
  balances/
  hcm/
  mock-hcm/
  sync/
  time-off-requests/