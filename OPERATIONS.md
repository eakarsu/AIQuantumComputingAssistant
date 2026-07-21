# Governed quantum knowledge operations

## Intended use and limits

The governed API answers from permissioned, versioned literature with chunk-level citations, uncertainty, and abstention. It does not execute quantum hardware, prove quantum advantage, or replace expert review. Label simulated or model-generated material and validate retrieval recall, faithfulness, citation coverage, freshness, conflicts, prompt-injection resistance, and deletion behavior before use.

## Data and integrations

Signed tenant claims, collection permissions, retention, checksummed source versions, and provenance are mandatory. Repository, object-storage, parser, index, and quantum-document actions enter an approval-gated outbox; payloads use references rather than credentials. Retries are bounded and dead letters require operator review.

## Deploy, rollback, and recovery

Run `./start.sh check`, back up PostgreSQL and referenced objects, then use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`. The migration is additive; roll back code without dropping evidence. Reconcile checksums and delivery receipts before replay. Rotate secrets centrally, invalidate old tokens, and alert on permission failures, retrieval drift, unsupported hardware claims, self-approval, expired worker leases, and dead letters.
