# V1-056 discovery workflow runbook

## Import and activation

1. Import both `workflows/v1-056-*.json` exports; they are intentionally inactive.
2. Configure the n8n RabbitMQ credential named `CAREEROS_RABBITMQ` outside the repository.
3. Set `JOB_SERVICE_URL` and inject `CAREEROS_AUTOMATION_TOKEN` from the environment secret
   store. The token needs only `discovery:write` and `discovery:run`.
4. Bind `careeros.profile.match-relevant-change.v1` as a durable quorum queue with the
   profile exchange and configure its dead-letter exchange/queue as
   `careeros.profile.match-relevant-change.v1.dlq`.
5. Configure `careeros.discovery.run.v1.dlq` as a durable quorum queue, then activate the
   projection workflow before the scheduled workflow.

## Delivery behavior

- Profile events are acknowledged only after the job-service projection call succeeds.
  Failed executions remain retryable and broker redelivery is safe because `eventId` is
  idempotent.
- Scheduled discovery uses one stable idempotency key per 15-minute UTC bucket. Attempts use
  30, 120 and 480 second waits; after the fourth failure a minimal dead-letter record is
  published.
- A job-service 2xx response completes the workflow. Authorization, validation and conflict
  responses are not retried indefinitely and remain visible through the final dead-letter
  status code.
- No workflow stores successful or failed execution payloads. Application-level metrics use
  correlation ID, attempt count, status and duration only.

## Replay and recovery

- Correct the provider, network or authorization cause before replay.
- Replay the profile event with its original `eventId`, or replay the scheduled command with
  its original `Idempotency-Key`; never mint a new key merely to bypass a failed claim.
- Remove a dead-letter record only after the corresponding idempotent replay succeeds.

## Safety

Never place bearer tokens, raw opportunity content, profile facts or contact data in workflow
exports, execution logs or dead-letter records. These workflows do not send messages, submit
applications, bypass CAPTCHAs or perform authenticated scraping.
