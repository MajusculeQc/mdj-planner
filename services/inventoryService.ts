import { FirebaseService } from './firebaseService';
import { InventoryItem, MaterialReservation, PurchaseRequest } from '../types';

export const InventoryService = {
    /**
     * Checks if an item is available on a specific date considering existing reservations.
     * Returns the quantity that can be fulfilled (0 to requestedQty).
     */
    getAvailableQuantity: (item: InventoryItem, reservations: MaterialReservation[], date: string, requestedQty: number): { available: number; missing: number } => {
        const total = item.totalQuantity;
        const reservedOnDate = reservations
            .filter(r => r.itemId === item.id && r.date === date && r.status === 'Réservé')
            .reduce((sum, r) => sum + r.quantityRequired, 0);

        const available = Math.max(0, total - reservedOnDate);
        const canFulfill = Math.min(available, requestedQty);
        const missing = Math.max(0, requestedQty - available);

        return { available: canFulfill, missing };
    },

    /**
     * Automatically creates a purchase request when a stock conflict is detected.
     */
    autoCreatePurchaseRequest: async (
        item: InventoryItem,
        missingQty: number,
        activityId: string,
        requesterEmail: string
    ): Promise<PurchaseRequest> => {
        const requestId = `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const purchaseRequest: PurchaseRequest = {
            id: requestId,
            itemId: item.id,
            customName: item.name,
            quantityNeeded: missingQty,
            reason: `Manque automatique pour l'activité ${activityId}`,
            linkedActivityId: activityId,
            status: 'En attente d\'approbation',
            estimatedCost: item.unitCost * missingQty,
            requestedBy: requesterEmail,
            timestamp: Date.now()
        };

        await FirebaseService.savePurchaseRequest(purchaseRequest);
        return purchaseRequest;
    },

    /**
     * Updates reservation status based on availability.
     */
    updateReservationStatus: (reservation: MaterialReservation, item: InventoryItem, allReservations: MaterialReservation[]): MaterialReservation => {
        const { missing } = InventoryService.getAvailableQuantity(
            item,
            allReservations.filter(r => r.id !== reservation.id),
            reservation.date,
            reservation.quantityRequired
        );

        return {
            ...reservation,
            status: missing > 0 ? 'Conflit (Manque)' : 'Réservé'
        };
    },

    /**
     * Processes material consumption for an activity.
     * Deducts quantity from inventory if the item is consumable.
     */
    processConsumption: async (
        reservation: MaterialReservation,
        item: InventoryItem,
        actualQty: number,
        notes: string
    ): Promise<void> => {
        // 1. If consumable, deduct from totalQuantity
        if (item.isConsumable) {
            const newTotal = Math.max(0, item.totalQuantity - actualQty);
            await FirebaseService.saveInventoryItem({
                ...item,
                totalQuantity: newTotal
            });
        }

        // 2. Update reservation status and usage data
        await FirebaseService.updateReservationUsage(reservation.id, {
            actualQuantityUsed: actualQty,
            usageNotes: notes,
            status: 'Consommé'
        });
    },

    /**
     * Updates an item's condition (damage reporting).
     */
    processDamage: async (
        item: InventoryItem,
        newCondition: 'Neuf' | 'Bon' | 'Usé' | 'À réparer' | 'Perdu'
    ): Promise<void> => {
        await FirebaseService.updateInventoryItemCondition(item.id, newCondition);
    },

    /**
     * Processes restock for an item (e.g. from a purchase).
     */
    processRestock: async (itemId: string, quantity: number): Promise<void> => {
        const item = await FirebaseService.getInventoryItem(itemId);
        if (!item) throw new Error("Article d'inventaire introuvable pour le réapprovisionnement");

        const newTotal = item.totalQuantity + quantity;
        await FirebaseService.saveInventoryItem({
            ...item,
            totalQuantity: newTotal
        });
    }
};
