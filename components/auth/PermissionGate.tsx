import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { checkAccess } from '../../lib/auth-utils';
import type { UserRole } from '../../lib/schemas';

interface PermissionGateProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    fallback?: React.ReactNode;
}

export const PermissionGate = ({ children, requiredRole, fallback = null }: PermissionGateProps) => {
    const { currentUser, userRole } = useAuth();

    if (!checkAccess(currentUser?.email, userRole, requiredRole)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
