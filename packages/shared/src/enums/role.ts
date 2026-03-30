export const Role = {
  HR: "hr",
  WORKER: "worker",
} as const

export type Role = (typeof Role)[keyof typeof Role]
