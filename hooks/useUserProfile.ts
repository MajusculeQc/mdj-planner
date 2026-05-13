import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { getUserRole } from '../lib/constants';

export interface UserProfile {
    email: string;
    avatarUrl?: string;
    theme: 'dark' | 'light';
    role?: 'admin' | 'super_admin' | 'animator' | 'viewer';
}

export function useUserProfile(user: User | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.email) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const emailKey = user.email!.toLowerCase();
                const docRef = doc(db, 'employee_profiles', emailKey);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                } else {
                    // Defaults if not exists - Bootstrap from ROLE_MAP
                    const role = getUserRole(emailKey);
                    const defaults: UserProfile = {
                        email: emailKey,
                        theme: 'dark',
                        role: role
                    };

                    // Attempt to save immediately to enable RBAC
                    try {
                        await setDoc(docRef, defaults, { merge: true });
                    } catch (e) {
                        console.warn("Could not bootstrap profile (likely permission denied):", e);
                    }

                    setProfile(defaults);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user || !user.email) return;

        try {
            const emailKey = user.email.toLowerCase();
            const updatedProfile = { ...profile, ...updates, email: emailKey };
            await setDoc(doc(db, 'employee_profiles', emailKey), updatedProfile, { merge: true });
            setProfile(updatedProfile as UserProfile);

            // Mettre à jour la classe HTML sur le body/html si le thème change
            if (updates.theme) {
                if (updates.theme === 'light') {
                    document.documentElement.classList.add('light-theme');
                    document.documentElement.classList.remove('dark');
                } else {
                    document.documentElement.classList.remove('light-theme');
                    document.documentElement.classList.add('dark');
                }
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return { profile, loading, updateProfile };
}
