import z from "zod";


export const ErrorSchema = z.object({
  title: z.string(),
  description: z.string(),
})

export type ErrorType = z.infer<typeof ErrorSchema>