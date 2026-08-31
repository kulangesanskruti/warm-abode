import { z } from "zod";

export const jobListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  state: z.string().trim().min(1).optional(),
  queue: z.string().trim().min(1).max(80).optional(),
});

export const retryJobSchema = z.object({ id: z.string().min(1) });
export type JobListQuery = z.infer<typeof jobListSchema>;
