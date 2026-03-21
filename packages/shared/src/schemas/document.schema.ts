import { z } from "zod"

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  templateId: z.string().optional(),
  categoryId: z.string().optional(),
  requiresSignature: z.boolean().default(false),
})

export const updateDocumentSchema = createDocumentSchema.partial()

export const assignDocumentSchema = z.object({
  documentId: z.string(),
  workerId: z.string(),
  message: z.string().optional(),
})

export const signDocumentSchema = z.object({
  documentId: z.string(),
  signatureToken: z.string().min(4, "Token mínimo 4 caracteres"),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
export type AssignDocumentInput = z.infer<typeof assignDocumentSchema>
export type SignDocumentInput = z.infer<typeof signDocumentSchema>
