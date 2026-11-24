# CareerOS Automation â€” service overview

## Responsibility

Host credential-free n8n workflow exports and repeatable cross-service orchestration.

## Data ownership

Workflow definitions, approval gates, retry policy and runbook documentation.

## Interfaces

- Inputs: Versioned service events and explicitly approved commands.
- Outputs: Idempotent service commands and workflow status events.
- Dependencies: CareerOS service APIs and configured n8n credentials outside the repository.

## V1-056 daily discovery

- `v1-056-profile-search-projection.json` consumes
  `profile.match-relevant-change.v1`, validates schema `1.0` and forwards the minimum
  schedule/signature projection to the job service. RabbitMQ acknowledgement happens only
  after successful execution.
- `v1-056-daily-opportunity-discovery.json` wakes every 15 minutes. The job service, not n8n,
  decides which active snapshots are inside their own timezone/window and have not run for
  that local day.
- Each 15-minute bucket has one stable idempotency key and correlation identifier. Four
  attempts reuse the same key with 30, 120 and 480 second waits. Exhaustion publishes only
  non-sensitive run metadata to `careeros.discovery.run.v1.dlq`.
- Workflow execution payload persistence is disabled for the scheduled flow. Exports contain
  no tokens or broker identifiers: `CAREEROS_AUTOMATION_TOKEN` comes from the runtime secret
  store and the configured n8n RabbitMQ credential is named `CAREEROS_RABBITMQ`.
- Replaying a profile event or discovery command is safe. Generic scraping, CAPTCHA bypass,
  authenticated scraping and application submission are outside these workflows.

Operational activation, broker policies and replay steps are documented in
[`v1-056-runbook.md`](v1-056-runbook.md).

## Contract rules

- APIs and events are versioned.
- Consumers must be idempotent where retries are possible.
- Correlation identifiers are propagated without logging sensitive payloads.
- Authorization and ownership are checked at the service boundary.

## Non-goals

This service does not absorb responsibilities owned by another CareerOS service. Cross-service workflows are coordinated through explicit contracts rather than shared databases.

## Security and privacy

Persist the minimum data required, record provenance, define retention, redact logs and use synthetic examples in this public repository.

The dead-letter record contains only schema version, idempotency key, correlation ID,
attempt count, failure time and HTTP status. It never contains a profile, opportunity body,
source wording or authorization token.
