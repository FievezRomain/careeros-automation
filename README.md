# CareerOS Automation

Host credential-free n8n workflow exports and repeatable cross-service orchestration.

## Scope

- **Owns:** Workflow definitions, approval gates, retry policy and runbook documentation.
- **Inputs:** Versioned service events and explicitly approved commands.
- **Outputs:** Idempotent service commands and workflow status events.
- **Dependencies:** CareerOS service APIs and configured n8n credentials outside the repository.

## Safety baseline

This public repository must never contain secrets, real resumes, real applications or personal data. External communication and application submission always require explicit user approval.

## Documentation

See [docs/overview.md](docs/overview.md) and the central [CareerOS workspace](https://github.com/FievezRomain/careeros-workspace).

## Development

Run `npm test` to validate every exported workflow for inactive-by-default state, credential
references, retry/DLQ policy, endpoint contracts and secret-free content.

## Status

Architecture and security baseline plus V1-056 profile-projection and daily-discovery
workflows. Imports remain inactive until environment credentials and endpoints are configured.

## License

Apache-2.0.
