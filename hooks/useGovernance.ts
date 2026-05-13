import { useState, useCallback, useEffect } from 'react';
import { BoardMember, VaultDocument } from '../types';
import * as governanceService from '../services/governanceService';

export const useGovernance = (userEmail?: string | null) => {
    const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
    const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [members, docs] = await Promise.all([
                governanceService.fetchBoardMembers(),
                governanceService.fetchVaultDocuments()
            ]);
            setBoardMembers(members);
            setVaultDocuments(docs);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des données de gouvernance');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const createBoardMember = async (memberData: Omit<BoardMember, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newMember = await governanceService.createBoardMember(memberData);
            setBoardMembers(prev => [...prev, newMember].sort((a, b) => a.lastName.localeCompare(b.lastName)));
            return newMember;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du membre du CA');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateBoardMember = async (id: string, updates: Partial<BoardMember>) => {
        setIsLoading(true);
        setError(null);
        try {
            await governanceService.updateBoardMember(id, updates);
            setBoardMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m));
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour du membre');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteBoardMember = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await governanceService.deleteBoardMember(id);
            setBoardMembers(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // VAULT
    const saveVaultDocument = async (docData: Omit<VaultDocument, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newDoc = await governanceService.saveVaultDocumentRecord(docData);
            setVaultDocuments(prev => [newDoc, ...prev].sort((a, b) => b.uploadDate - a.uploadDate));
            return newDoc;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'enregistrement du document');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteVaultDocument = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await governanceService.deleteVaultDocumentRecord(id);
            setVaultDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression du document');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        boardMembers,
        vaultDocuments,
        isLoading,
        error,
        loadData,
        createBoardMember,
        updateBoardMember,
        deleteBoardMember,
        saveVaultDocument,
        deleteVaultDocument
    };
};
