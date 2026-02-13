import z from "zod";

const userSchema = z.strictObject({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    age: z.number().int().positive(),
});

export type User = z.infer<typeof userSchema>;

export const userJsonSchema = z.toJSONSchema(userSchema);

console.log("User JSON Schema:", JSON.stringify(userJsonSchema, null, 2));