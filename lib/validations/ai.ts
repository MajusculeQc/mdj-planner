import { z } from 'zod';

export const AIRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt cannot be empty"),
    modelName: z.string().min(1, "Model name is missing"),
    apiKey: z.string().min(1, "API Key is missing"),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;
