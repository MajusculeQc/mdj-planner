import { z } from 'zod';
import type { UserRole } from './schemas';

// ═══════════════════════════════════════════════════════════════════════════
// SUPER-ADMIN CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const SUPER_ADMIN_EMAIL = 'admin@mdjescalejeunesse.ca' as const;

const EmailSchema = z.string().email();

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/** Early-return identity check for super-admin bypass. */
export const isSuperAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) return false;
    return parsed.data.toLowerCase() === SUPER_ADMIN_EMAIL;
};

/** Role hierarchy for permission comparison. */
const ROLE_HIERARCHY: Record<UserRole, number> = {
    super_admin: 100,
    admin: 80,
    animator: 40,
    viewer: 10,
};

/**
 * Centralized access check.
 * 1. Super-admin → always true (bypass).
 * 2. No required role → true (public).
 * 3. Otherwise → compare role hierarchy.
 */
export const checkAccess = (
    email: string | null | undefined,
    userRole: UserRole,
    requiredRole?: UserRole,
): boolean => {
    if (!email) return false;

    // Early Return: Super-Admin Bypass
    if (isSuperAdmin(email)) return true;

    if (!requiredRole) return true;
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};
