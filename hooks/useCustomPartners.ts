import { useState, useEffect, useMemo } from 'react';
import { PartnerService, CustomPartner } from '../services/partnerService';
import { VENUES } from '../lib/constants';

export function useCustomPartners() {
    const [customPartners, setCustomPartners] = useState<CustomPartner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPartners = async () => {
        setLoading(true);
        const data = await PartnerService.getAll();
        setCustomPartners(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const allVenues = useMemo(() => {
        // Merge static venues with custom ones
        const merged = { ...VENUES };

        customPartners.forEach(p => {
            // @ts-ignore
            merged[p.name] = {
                name: p.name,
                address: p.address,
                phone: p.phone || '',
                email: p.email || '',
                website: p.website || '',
                facebook: p.facebook || '',
            };
        });

        return merged;
    }, [customPartners]);

    return { customPartners, allVenues, loading, refresh: fetchPartners };
}
