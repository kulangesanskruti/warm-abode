-- Scheduler single-flight lease + idempotent run markers
CREATE TABLE "scheduler_locks" (
    "name" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scheduler_locks_pkey" PRIMARY KEY ("name")
);

CREATE TABLE "scheduler_runs" (
    "key" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detail" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "scheduler_runs_pkey" PRIMARY KEY ("key")
);
