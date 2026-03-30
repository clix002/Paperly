export type Worker = {
  id: string
  name: string
  email: string
  role: string
}

export type SendTarget = {
  id: string
  title: string
  status: string
  requiresSignature: boolean
  cloneCount: number
  sentReceiverIds: string[]
  createdAt: string
}

export type SendDocumentPanelProps = {
  target: SendTarget
  onClose: () => void
  onSent: () => void
}
