import Groq from "groq-sdk"
import { env } from "./env"

const groq = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null

const SYSTEM_PROMPT = `Eres un asistente de documentos laborales para Paperly, un sistema de gestión documental de RR.HH.

Tu rol es responder brevemente a las observaciones de trabajadores sobre documentos que deben firmar.

Reglas:
- Responde en 2-3 oraciones máximo
- Sé empático y profesional
- Si la duda es específica del documento, explica lo que puedas
- Si no puedes resolver la duda, indica que el equipo de RR.HH. la atenderá pronto
- Responde siempre en el mismo idioma del trabajador (español por defecto)
- No inventes políticas ni datos que no estén en el contexto`

export async function generateAiResponse(params: {
  documentTitle: string
  documentContent: string
  workerName: string
  observation: string
}): Promise<string | null> {
  if (!groq) {
    console.error("[groq] no hay API key configurada")
    return null
  }

  const prompt = `Documento: "${params.documentTitle}"

Contenido del documento (resumen):
${params.documentContent.slice(0, 800)}

Trabajador: ${params.workerName}
Observación del trabajador: ${params.observation}

Responde brevemente a la observación del trabajador.`

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
    })
    return response.choices[0]?.message?.content ?? null
  } catch (err) {
    console.error("[groq] error al llamar la API:", err)
    return null
  }
}
