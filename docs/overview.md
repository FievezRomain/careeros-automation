# CareerOS Automation â€” service overview

## Responsibility

Host credential-free n8n workflow exports and repeatable cross-service orchestration.

## Data ownership

Workflow definitions, approval gates, retry policy and runbook documentation.

## Interfaces

- Inputs: Versioned service events and explicitly approved commands.
- Outputs: Idempotent service commands and workflow status events.
- Dependencies: CareerOS service APIs and configured n8n credentials outside the repository.

## Contract rules

- APIs and events are versioned.
- Consumers must be idempotent where retries are possible.
- Correlation identifiers are propagated without logging sensitive payloads.
- Authorization and ownership are checked at the service boundary.

## Non-goals

This service does not absorb responsibilities owned by another CareerOS service. Cross-service workflows are coordinated through explicit contracts rather than shared databases.

## Security and privacy

Persist the minimum data required, record provenance, define retention, redact logs and use synthetic examples in this public repository.