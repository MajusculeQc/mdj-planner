import { useState, useEffect, useCallback, useMemo } from 'react';
import { MaterialReservation, InventoryItem } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { InventoryService } from '../services/inventoryService';

export function useReservations(items: InventoryItem[], currentUserEmail?: string) {
    const [reservations, setReservations] = useState<MaterialReservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUserEmail) {
            setIsLoading(false);
            return;
        }
        const unsubscribe = FirebaseService.subscribeToReservations((cloudRes) => {
            setReservations(cloudRes);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [currentUserEmail]);

    const saveReservation = useCallback(async (res: MaterialReservation) => {
        try {
            await FirebaseService.saveReservation(res);
        } catch (error) {
            console.error("Error saving reservation:", error);
            throw error;
        }
    }, []);

    const deleteReservation = useCallback(async (id: string) => {
        try {
            await FirebaseService.deleteReservation(id);
        } catch (error) {
            console.error("Error deleting reservation:", error);
            throw error;
        }
    }, []);

    // Calculate availability for a specific item on a specific date
    const getAvailableStock = useCallback((itemId: string, date: string) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return 0;

        const total = item.totalQuantity;
        // Count reservations for the SAME item on the SAME date
        // Note: For non-consumables, we only care about the same day (assuming items are returned).
        // For consumables, availability is harder to track globally without a cumulative log, 
        // but for now we follow the user's logic of "stock at date X".
        const reservedOnDate = reservations
            .filter(r => r.itemId === itemId && r.date === date && r.status === 'Réservé')
            .reduce((sum, r) => sum + r.quantityRequired, 0);

        return Math.max(0, total - reservedOnDate);
    }, [items, reservations]);

    const getReservationsForActivity = useCallback((activityId: string) => {
        return reservations.filter(r => r.activityId === activityId);
    }, [reservations]);

    const validateConsumption = useCallback(async (resId: string, actualQty: number, notes: string) => {
        const res = reservations.find(r => r.id === resId);
        if (!res) throw new Error("Réservation introuvable");

        const item = items.find(i => i.id === res.itemId);
        if (!item) throw new Error("Article d'inventaire introuvable");

        try {
            await InventoryService.processConsumption(res, item, actualQty, notes);
        } catch (error) {
            console.error("Error validating consumption:", error);
            throw error;
        }
    }, [reservations, items]);

    return {
        reservations,
        isLoading,
        saveReservation,
        deleteReservation,
        validateConsumption,
        getAvailableStock,
        getReservationsForActivity
    };
}
