# StayHub backend production deployment

## Required configuration

Set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, and a log destination suitable for the platform. If Redis is enabled, provide `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the equivalent Upstash names). Do not use the development JWT fallback in production.

## Release order

1. Build and run `npx prisma generate`.
2. Apply reviewed migrations with `npx prisma migrate deploy`.
3. Start the API with `node dist/server.js` (or the platform's equivalent).
4. Route health checks to `/api/v1/health/live` and traffic readiness checks to `/api/v1/health/ready`.

The readiness probe checks Prisma and, when configured, Redis. A missing Redis configuration is reported as `not_configured` and does not block readiness; configure Redis before enabling queue-backed workers.

## Jobs

The API stores jobs in `BackgroundJob` with idempotency keys, atomic claims, bounded retries, and `DEAD_LETTER` state. Redis is an acceleration/dispatch layer, not the source of truth. In serverless deployments, invoke the authenticated job process endpoint from an external scheduler or run a separate worker; do not depend on an in-process interval surviving between requests.

## Shutdown and rollback

SIGTERM/SIGINT stop accepting new requests, close Prisma and its pool, and exit after `SHUTDOWN_TIMEOUT_MS`. Roll back application code independently from schema changes; only use backward-compatible migrations during rolling deploys, and restore the previous application version before reverting a destructive migration.

## Supabase status

Supabase is connected to the project, but this backend currently uses Prisma/Postgres for its domain data. No Supabase schema or auth changes are part of this hardening release.
