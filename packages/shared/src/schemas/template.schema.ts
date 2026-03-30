import { z } from "zod"

export const createTemplateSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
})

export const updateTemplateSchema = createTemplateSchema.partial()

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
