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

## Status

Architecture and security baseline. Functional implementation will be added incrementally with tests and versioned contracts.

## License

Apache-2.0.