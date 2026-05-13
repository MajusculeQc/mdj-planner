import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseService';
import { BoardMember, VaultDocument } from '../types';
import { BoardMemberSchema, VaultDocumentSchema } from '../lib/schemas';

const MEMBERS_COLLECTION = 'board_members';
const VAULT_COLLECTION = 'vault_documents';

// ═══════════════════════════════════════════════════════════════════════════
// BOARD MEMBERS
// ═══════════════════════════════════════════════════════════════════════════

export const fetchBoardMembers = async (): Promise<BoardMember[]> => {
    try {
        const q = query(collection(db, MEMBERS_COLLECTION), orderBy('lastName', 'asc'));
        const snapshot = await getDocs(q);

        const members: BoardMember[] = [];
        snapshot.forEach((doc) => {
            const parsed = BoardMemberSchema.safeParse(doc.data());
            if (parsed.success) {
                members.push(parsed.data);
            }
        });
        return members;
    } catch (error) {
        console.error("Error fetching board members:", error);
        throw error;
    }
};

export const createBoardMember = async (memberData: Omit<BoardMember, 'id'>): Promise<BoardMember> => {
    try {
        const newRef = doc(collection(db, MEMBERS_COLLECTION));
        const member: BoardMember = {
            ...memberData,
            id: newRef.id,
            updatedAt: Date.now(),
        };
        const validated = BoardMemberSchema.parse(member);
        await setDoc(newRef, validated);
        return validated;
    } catch (error) {
        console.error("Error creating board member:", error);
        throw error;
    }
};

export const updateBoardMember = async (id: string, updates: Partial<BoardMember>): Promise<void> => {
    try {
        const ref = doc(db, MEMBERS_COLLECTION, id);
        await updateDoc(ref, {
            ...updates,
            updatedAt: Date.now(),
        });
    } catch (error) {
        console.error("Error updating board member:", error);
        throw error;
    }
};

export const deleteBoardMember = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting board member:", error);
        throw error;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// VAULT DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════

export const fetchVaultDocuments = async (): Promise<VaultDocument[]> => {
    try {
        const q = query(collection(db, VAULT_COLLECTION), orderBy('uploadDate', 'desc'));
        const snapshot = await getDocs(q);

        const docs: VaultDocument[] = [];
        snapshot.forEach((doc) => {
            const parsed = VaultDocumentSchema.safeParse(doc.data());
            if (parsed.success) {
                docs.push(parsed.data);
            }
        });
        return docs;
    } catch (error) {
        console.error("Error fetching vault documents:", error);
        throw error;
    }
};

export const saveVaultDocumentRecord = async (docData: Omit<VaultDocument, 'id'>): Promise<VaultDocument> => {
    try {
        const newRef = doc(collection(db, VAULT_COLLECTION));
        const document: VaultDocument = {
            ...docData,
            id: newRef.id,
            uploadDate: docData.uploadDate || Date.now()
        };
        const validated = VaultDocumentSchema.parse(document);
        await setDoc(newRef, validated);
        return validated;
    } catch (error) {
        console.error("Error creating vault doc record:", error);
        throw error;
    }
};

export const deleteVaultDocumentRecord = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, VAULT_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting vault doc record:", error);
        throw error;
    }
};
