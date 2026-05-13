import { useState, useEffect, useCallback } from 'react';
import { PurchaseRequest } from '../types';
import { FirebaseService } from '../services/firebaseService';

export function usePurchases(currentUserEmail?: string, role?: string) {
    const [requests, setRequests] = useState<PurchaseRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUserEmail || !role || role === 'viewer') {
            setIsLoading(false);
            return;
        }
        const unsubscribe = FirebaseService.subscribeToPurchases((cloudRequests) => {
            setRequests(cloudRequests);
            setIsLoading(false);
        });
        return unsubscribe;
    }, [currentUserEmail, role]);

    const saveRequest = useCallback(async (request: PurchaseRequest) => {
        try {
            await FirebaseService.savePurchaseRequest(request);
        } catch (error) {
            console.error("Error saving purchase request:", error);
            throw error;
        }
    }, []);

    const deleteRequest = useCallback(async (id: string) => {
        try {
            await FirebaseService.deletePurchaseRequest(id);
        } catch (error) {
            console.error("Error deleting purchase request:", error);
            throw error;
        }
    }, []);

    const getRequestsForActivity = useCallback((activityId: string) => {
        return requests.filter(req => req.linkedActivityId === activityId);
    }, [requests]);

    return {
        requests,
        isLoading,
        saveRequest,
        deleteRequest,
        getRequestsForActivity
    };
}
