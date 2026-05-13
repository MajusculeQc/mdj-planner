import { useState, useCallback, useEffect } from 'react';
import { FinancialHealth } from '../types';
import * as financialService from '../services/financialService';

export const useFinancialHealth = (year: number) => {
    const [financialData, setFinancialData] = useState<FinancialHealth | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await financialService.fetchFinancialHealthForYear(year);
            if (data) {
                setFinancialData(data);
            } else {
                // Initialize default empty structure for the year if none exists
                setFinancialData({
                    id: `financial_${year}`,
                    year,
                    psocRevenue: 0,
                    otherGrantsRevenue: 0,
                    autonomousRevenue: 0,
                    totalExpenses: 0,
                    accumulatedSurplus: 0,
                    updatedAt: Date.now()
                });
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des données financières');
        } finally {
            setIsLoading(false);
        }
    }, [year]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveFinancialData = async (updates: Partial<FinancialHealth>, userEmail?: string) => {
        if (!financialData) return;
        setIsLoading(true);
        setError(null);
        try {
            const updatedData = { ...financialData, ...updates };
            if (userEmail) {
                updatedData.updatedByEmail = userEmail;
            }
            const saved = await financialService.saveFinancialHealth(updatedData, updatedData.id);
            setFinancialData(saved);
            return saved;
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sauvegarde des données');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        financialData,
        isLoading,
        error,
        saveFinancialData,
        refreshData: loadData
    };
};
