import React from 'react';
import { User } from 'firebase/auth';
import { Utensils, Bus, Package, Ticket, DollarSign } from 'lucide-react';
import { EMPLOYEE_AVATARS } from './constants';

/**
 * Returns the employee avatar URL or the user's photoURL.
 */
export const getEmployeeAvatar = (user: User | null): string | null => {
    if (!user?.email) return null;
    const normalized = user.email.toLowerCase();
    return EMPLOYEE_AVATARS[normalized as keyof typeof EMPLOYEE_AVATARS] ?? user.photoURL ?? null;
};

/**
 * Returns a CSS class string for the readiness score border and text.
 */
export const getStatusColor = (score: number): string => {
    if (score >= 100) return 'border-emerald-600 bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
    if (score >= 50) return 'border-amber-500 bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20';
    return 'border-orange-600 bg-orange-500 text-white shadow-md shadow-orange-500/20';
};

/**
 * Returns the Lucide icon for a given budget category.
 */
export const getBudgetIcon = (category: string) => {
    switch (category) {
        case 'Nourriture': return <Utensils className="w-3 h-3" />;
        case 'Transport': return <Bus className="w-3 h-3" />;
        case 'Matériel': return <Package className="w-3 h-3" />;
        case 'Activités': return <Ticket className="w-3 h-3" />;
        default: return <DollarSign className="w-3 h-3 text-gray-400" />;
    }
};

/**
 * Returns a CSS class string for the budget category badge.
 */
export const getBudgetColor = (category: string): string => {
    switch (category) {
        case 'Nourriture': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
        case 'Transport': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case 'Matériel': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
        case 'Activités': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
};
