import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseService';
import { Member } from '../types';
import { MemberSchema } from '../lib/schemas';

const LOCAL_COLLECTION = 'members';
const WEB_COLLECTION = 'users';

/**
 * Génère un code d'anonymisation pour un membre (ex: LP-1008)
 */
export const generateMemberCode = (firstName: string, lastName: string, birthDate: string, preferredFirstName?: string): string => {
    const fName = preferredFirstName || firstName;
    const initials = `${fName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const dateParts = birthDate.split('-'); // YYYY-MM-DD
    if (dateParts.length === 3) {
        const year = dateParts[0].substring(2);
        const month = dateParts[1];
        return `${initials}-${month}${year}`;
    }
    return `${initials}-${Math.floor(Math.random() * 9000) + 1000}`;
};

/**
 * Mappe un profil utilisateur du site web vers le format Membre du planificateur
 */
const mapWebUserToMember = (userData: any, id: string): Member | null => {
    // FILTRAGE : On ne veut que les "MEMBER" (jeunes) dans le registre des jeunes.
    // Les ADMIN, STAFF, etc. sont déjà gérés via l'authentification du personnel.
    if (userData.role !== 'MEMBER') return null;

    // Mapping du statut
    const webStatus = userData.metadata?.membershipStatus;
    let status: 'Actif' | 'Inactif' | 'Suspendu' = 'Actif';
    if (webStatus === 'SUSPENDED') status = 'Suspendu';
    else if (webStatus === 'EXPIRED' || webStatus === 'PENDING') status = 'Inactif';

    // Extraction et concaténation de TOUS les contacts d'urgence
    const emergencyContacts = Array.isArray(userData.emergencyContacts)
        ? userData.emergencyContacts
            .filter((c: any) => c.name && c.phone)
            .map((c: any) => `${c.name} (${c.relation || 'Contact'}): ${c.phone}`)
            .join(' | ')
        : '';

    // Formatage de l'adresse
    const addr = userData.address;
    const fullAddress = addr ? `${addr.street || ''}, ${addr.city || ''}, ${addr.postalCode || ''}`.replace(/^, |, $/g, '').trim() : '';

    const firstName = userData.firstName || '';
    const preferredFirstName = userData.preferredFirstName || '';
    const lastName = userData.lastName || '';

    // VALIDATION DATE DE NAISSANCE : Éviter l'an 20000 ou dates futures
    let birthDate = userData.birthDate || '2010-01-01';
    try {
        const bdt = new Date(birthDate);
        const now = new Date();
        const minDate = new Date('1900-01-01');
        // Si date invalide, future, ou trop vieille -> fallback vers une date raisonnable (2010)
        if (isNaN(bdt.getTime()) || bdt > now || bdt < minDate) {
            birthDate = '2010-01-01';
        }
    } catch (e) {
        birthDate = '2010-01-01';
    }

    return {
        id: id,
        firstName,
        preferredFirstName,
        lastName,
        birthDate,
        gender: 'Préfère ne pas répondre', // Non présent dans UserProfile de base
        status,
        registrationDate: userData.metadata?.createdAt?.seconds
            ? userData.metadata.createdAt.seconds * 1000
            : Date.now(),
        allergies: userData.medical?.allergies?.join(', ') || '',
        parentContact: userData.parentEmail || '',
        emergencyContact: emergencyContacts.substring(0, 300),
        notes: `[SÉCURISÉ SITE WEB] Email: ${userData.email || ''}${fullAddress ? ` | Adr: ${fullAddress}` : ''}`,
        schoolOrNeighbourhood: userData.schoolOrNeighbourhood || '',
        referenceSource: userData.referenceSource || 'Autre',
        updatedAt: Date.now(),
        code: generateMemberCode(firstName, lastName, birthDate, preferredFirstName),
        isSynced: true
    } as any;
};

export const fetchMembers = async (): Promise<Member[]> => {
    try {
        let webMembers: Member[] = [];
        try {
            // 1. Fetch from Local Sync Collection (Pushed from Website or External Scripts)
            const webSnapshot = await getDocs(collection(db, WEB_COLLECTION));
            webMembers = webSnapshot.docs
                .map(doc => mapWebUserToMember(doc.data(), doc.id))
                .filter((m): m is Member => m !== null);
        } catch (error) {
            console.error("Error fetching web members (sync):", error);
            // On continue avec les membres locaux si le sync échoue (ex: mauvaise collection ou permissions)
        }

        // 2. Fetch from Local Database (Legacy/Internal)
        const localSnapshot = await getDocs(query(
            collection(db, LOCAL_COLLECTION),
            orderBy('lastName', 'asc'),
            limit(500) // Safety limit for performance
        ));

        const webKeys = new Set(webMembers.map(wm =>
            `${wm.firstName}|${wm.lastName}|${wm.birthDate}`.toLowerCase()
        ));

        const localMembers: Member[] = [];
        localSnapshot.forEach((doc) => {
            const data = doc.data();
            const key = `${data.firstName}|${data.lastName}|${data.birthDate}`.toLowerCase();

            if (!webKeys.has(key)) {
                const parsed = MemberSchema.safeParse(data);
                if (parsed.success) {
                    localMembers.push({ ...parsed.data, isSynced: false } as any);
                }
            }
        });

        // Combiner et trier
        return [...webMembers, ...localMembers].sort((a, b) => a.lastName.localeCompare(b.lastName));
    } catch (error) {
        console.error("Error fetching members:", error);
        throw error;
    }
};

export const createMember = async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    try {
        const newRef = doc(collection(db, LOCAL_COLLECTION));
        const code = memberData.code || generateMemberCode(memberData.firstName, memberData.lastName, memberData.birthDate);

        const member: Member = {
            ...memberData,
            id: newRef.id,
            code,
            registrationDate: memberData.registrationDate || Date.now(),
            updatedAt: Date.now(),
        };

        const validated = MemberSchema.parse(member);
        await setDoc(newRef, validated);
        return validated;
    } catch (error) {
        console.error("Error creating member:", error);
        throw error;
    }
};

export const updateMember = async (id: string, updates: Partial<Member>): Promise<void> => {
    try {
        const ref = doc(db, LOCAL_COLLECTION, id);
        const finalUpdates = {
            ...updates,
            updatedAt: Date.now(),
        };
        await updateDoc(ref, finalUpdates);
    } catch (error) {
        console.error("Error updating member:", error);
        throw error;
    }
};

export const deleteMember = async (id: string): Promise<void> => {
    try {
        // Supprimer des deux collections possibles (local et sync)
        const localRef = doc(db, LOCAL_COLLECTION, id);
        const webRef = doc(db, WEB_COLLECTION, id);

        await Promise.allSettled([
            deleteDoc(localRef),
            deleteDoc(webRef)
        ]);
    } catch (error) {
        console.error("Error deleting member:", error);
        throw error;
    }
};

