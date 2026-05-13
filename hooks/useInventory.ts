import { useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '../types';
import { FirebaseService } from '../services/firebaseService';

export function useInventory(currentUserEmail?: string, role?: string) {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUserEmail || !role || role === 'viewer') {
            setIsLoading(false);
            return;
        }
        const unsubscribe = FirebaseService.subscribeToInventory((cloudItems) => {
            setItems(cloudItems);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [currentUserEmail, role]);

    const saveItem = useCallback(async (item: InventoryItem) => {
        try {
            await FirebaseService.saveInventoryItem(item);
        } catch (error) {
            console.error("Error saving inventory item:", error);
            throw error;
        }
    }, []);

    const deleteItem = useCallback(async (id: string) => {
        try {
            await FirebaseService.deleteInventoryItem(id);
        } catch (error) {
            console.error("Error deleting inventory item:", error);
            throw error;
        }
    }, []);

    const getItemById = useCallback((id: string) => {
        return items.find(item => item.id === id);
    }, [items]);

    const updateItemCondition = useCallback(async (id: string, condition: 'Neuf' | 'Bon' | 'Usé' | 'À réparer' | 'Perdu') => {
        try {
            await FirebaseService.updateInventoryItemCondition(id, condition);
        } catch (error) {
            console.error("Error updating inventory item condition:", error);
            throw error;
        }
    }, []);

    return {
        items,
        isLoading,
        saveItem,
        deleteItem,
        updateItemCondition,
        getItemById
    };
}
