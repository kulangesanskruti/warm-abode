-- AlterTable
-- The Rent Management feature needs a real, stable "due date" per billing
-- month to determine Pending vs Overdue status. Rather than introducing a
-- new tenant-level column, each Payment row now stores the computed due
-- date for that specific month/year (derived from the tenant's move-in-day
-- anniversary at generation time), so status can be derived by a simple
-- "dueDate < now()" comparison instead of recomputing it from createdAt.
ALTER TABLE "payments" ADD COLUMN "dueDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "payments_dueDate_idx" ON "payments"("dueDate");
