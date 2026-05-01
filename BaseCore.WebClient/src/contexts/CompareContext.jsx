import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CompareContext = createContext(null);
const BASE_COMPARE_KEY = 'store_compare';

export const CompareProvider = ({ children }) => {
    const { user } = useAuth();
    const storageKey = user ? `${BASE_COMPARE_KEY}_${user.userId}` : `${BASE_COMPARE_KEY}_guest`;

    const [compareItems, setCompareItems] = useState([]);
    const [loadedKey, setLoadedKey] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        setCompareItems(stored ? JSON.parse(stored) : []);
        setLoadedKey(storageKey);
    }, [storageKey]);

    useEffect(() => {
        if (loadedKey === storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(compareItems));
        }
    }, [compareItems, storageKey, loadedKey]);

    const toggleCompare = (product) => {
        setCompareItems((currentItems) => {
            const exists = currentItems.find((item) => item.id === product.id);
            if (exists) {
                return currentItems.filter((item) => item.id !== product.id);
            }
            if (currentItems.length >= 4) {
                // Optional: show a message that max 4 items allowed
                alert('You can only compare up to 4 products at a time.');
                return currentItems;
            }
            return [...currentItems, product];
        });
    };

    const isInCompare = (productId) => {
        return compareItems.some((item) => item.id === productId);
    };

    const removeFromCompare = (productId) => {
        setCompareItems((current) => current.filter((item) => item.id !== productId));
    };

    return (
        <CompareContext.Provider
            value={{
                compareItems,
                toggleCompare,
                isInCompare,
                removeFromCompare,
                compareCount: compareItems.length
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
};
