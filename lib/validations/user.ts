import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid("Invalid unique identifier format."),
    username: z.string()
        .min(3, "Username must be at least 3 characters.")
        .max(20, "Username cannot exceed 20 characters.")
        .trim(),
    email: z.string().email("Invalid email format."),
    role: z.enum(['ADMIN', 'USER', 'GUEST'], {
        message: "Invalid role assigned."
    }).default('USER'),
    age: z.number()
        .min(18, "Age must be at least 18.")
        .max(100, "Age cannot exceed 100.")
        .optional(),
    isActive: z.boolean().default(true),
    password: z.string()
        .min(8, "Password must be at least 8 characters.")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must include at least one special symbol.")
        .optional(),
    confirmPassword: z.string().optional(),
    createdAt: z.coerce.date()
}).strict().refine((data) => {
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
});

export type User = z.infer<typeof UserSchema>;

export const validateUser = (data: unknown): User => {
    const result = UserSchema.safeParse(data);

    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }

    return result.data;
};
