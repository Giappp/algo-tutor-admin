import {z} from 'zod';

export const tagSearchSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
    name: z.string().optional()
});

export type TagSearch = z.infer<typeof tagSearchSchema>;
