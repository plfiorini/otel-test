import { z } from "zod";

export const diceRollQuerySchema = z.object({
    rolls: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined))
        .refine(
            (val) => val === undefined || (Number.isInteger(val) && val > 0),
            {
                message: "Invalid number of rolls. Must be a positive integer.",
            }
        ),
});