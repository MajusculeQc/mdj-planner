import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with conflict resolution.
 * Usage: cn('bg-red-500', condition && 'bg-blue-500')
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Strip HTML tags from user input to prevent XSS.
 * Preserves plain text content.
 */
export function sanitize(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Safely extract error message from unknown error type.
 * Use instead of `(error as any).message`.
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Une erreur inconnue est survenue.';
}

/**
 * Type-safe check if a value is defined (non-null, non-undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Check if the given activity title represents an absence, vacation, or time off.
 */
export function isAbsence(title: string): boolean {
    if (!title) return false;
    const t = title.toUpperCase();
    return t.startsWith('ABSENCE') || t.startsWith('VACANCE') || t.startsWith('CONGÉ') || t.startsWith('CONGE') || t.startsWith('GRÈVE') || t.startsWith('GREVE') || t.includes('FERMÉ');
}
