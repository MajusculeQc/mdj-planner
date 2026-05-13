import { useState, useCallback, useEffect } from 'react';
import { Member } from '../types';
import * as memberService from '../services/memberService';

export const useMembers = (userEmail?: string | null) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadMembers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await memberService.fetchMembers();
            setMembers(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des membres');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const createMember = async (memberData: Omit<Member, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newMember = await memberService.createMember({
                ...memberData,
                createdByEmail: userEmail || undefined
            });
            setMembers(prev => [...prev, newMember].sort((a, b) => a.lastName.localeCompare(b.lastName)));
            return newMember;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du membre');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateMember = async (id: string, updates: Partial<Member>) => {
        setIsLoading(true);
        setError(null);
        try {
            await memberService.updateMember(id, updates);
            setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m));
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour du membre');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMember = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await memberService.deleteMember(id);
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression du membre');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        members,
        isLoading,
        error,
        loadMembers,
        createMember,
        updateMember,
        deleteMember,
    };
};
