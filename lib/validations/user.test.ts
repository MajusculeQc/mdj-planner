import { describe, it, expect } from 'vitest';
import { UserSchema, validateUser } from './user';

describe('UserSchema Validation', () => {
    it('should validate a correct user object', () => {
        const validUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'JohnDoe',
            email: 'john@mdjescalejeunesse.ca',
            role: 'ADMIN',
            age: 25,
            isActive: true,
            createdAt: new Date()
        };

        const result = UserSchema.safeParse(validUser);
        expect(result.success).toBe(true);
    });

    it('should throw an error for invalid email', () => {
        const invalidUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'JohnDoe',
            email: 'invalid-email',
            createdAt: new Date()
        };

        expect(() => validateUser(invalidUser)).toThrow("Invalid email format.");
    });

    it('should throw an error when passwords do not match', () => {
        const passwordMismatchUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'JohnDoe',
            email: 'john@mdjescalejeunesse.ca',
            password: 'Password123!',
            confirmPassword: 'Password123?',
            createdAt: new Date()
        };

        expect(() => validateUser(passwordMismatchUser)).toThrow("Passwords do not match.");
    });
});
