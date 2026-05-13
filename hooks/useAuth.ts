import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { FirebaseService } from '../services/firebaseService';
import { getUserRole } from '../lib/constants';
import { isSuperAdmin } from '../lib/auth-utils';
import type { UserRole } from '../lib/schemas';

interface AuthState {
    currentUser: User | null;
    userRole: UserRole;
    showLoginMenu: boolean;
    setShowLoginMenu: (v: boolean) => void;
    handleGoogleLogin: () => Promise<void>;
    handleMicrosoftLogin: () => Promise<void>;
    handleLogout: () => Promise<void>;
    handleEmailLogin: (email: string, pass: string) => Promise<void>;
    isSuperAdmin: boolean;
}

export function useAuth(): AuthState {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showLoginMenu, setShowLoginMenu] = useState(false);

    useEffect(() => {
        const unsubscribe = FirebaseService.subscribeToAuth((user) => {
            setCurrentUser(user);
            if (user) setShowLoginMenu(false);
        });
        return unsubscribe;
    }, []);

    const handleGoogleLogin = async () => {
        try {
            await FirebaseService.login();
        } catch {
            alert("Erreur de connexion Google.");
        }
    };

    const handleMicrosoftLogin = async () => {
        try {
            await FirebaseService.loginWithMicrosoft();
        } catch {
            alert("Erreur de connexion Microsoft.");
        }
    };

    const handleLogout = async () => {
        await FirebaseService.logout();
    };

    const handleEmailLogin = async (email: string, pass: string) => {
        try {
            await FirebaseService.loginWithEmail(email, pass);
        } catch (err: any) {
            console.error("Maintenance login error:", err);
            const msg = err.message || "Identifiants invalides.";
            alert(`Accès Maintenance : ${msg}`);
        }
    };

    const userRole = getUserRole(currentUser?.email ?? undefined);

    return {
        currentUser,
        userRole,
        showLoginMenu,
        setShowLoginMenu,
        handleGoogleLogin,
        handleMicrosoftLogin,
        handleLogout,
        handleEmailLogin,
        isSuperAdmin: isSuperAdmin(currentUser?.email),
    };
}
