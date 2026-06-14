import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

/**
 * Store-wide settings (store name, hotline, email, address, social links...) are
 * served by the backend StoreSettings endpoint (`GET /api/settings`). This context
 * fetches them once and exposes them to the whole app so no component needs to
 * hard-code contact / branding information.
 */
const DEFAULTS = {
    storeName: 'TechStore',
    hotline: '',
    supportEmail: '',
    address: '',
    warrantyAddress: '',
    supportTime: '',
    logoUrl: '',
    facebookUrl: '',
    zaloUrl: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    bankAccounts: [],
};

const StoreSettingsContext = createContext(DEFAULTS);

export function StoreSettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);

    useEffect(() => {
        let active = true;
        settingsApi
            .get()
            .then((res) => {
                if (active && res?.data) {
                    setSettings({ ...DEFAULTS, ...res.data });
                }
            })
            .catch(() => {
                // Keep defaults on failure; UI stays functional.
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <StoreSettingsContext.Provider value={settings}>
            {children}
        </StoreSettingsContext.Provider>
    );
}

export function useStoreSettings() {
    return useContext(StoreSettingsContext);
}

export default StoreSettingsContext;
