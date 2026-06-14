import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { isStoreViewOnlyUser, STORE_VIEW_ONLY_MESSAGE, toast } from '../utils/store';

const WishlistContext = createContext(null);
const BASE_WISHLIST_KEY = 'store_wishlist';

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const storageKey = user ? `${BASE_WISHLIST_KEY}_${user.userId}` : `${BASE_WISHLIST_KEY}_guest`;

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loadedKey, setLoadedKey] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        setWishlistItems(stored ? JSON.parse(stored) : []);
        setLoadedKey(storageKey);
    }, [storageKey]);

    useEffect(() => {
        if (loadedKey === storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
        }
    }, [wishlistItems, storageKey, loadedKey]);

    const toggleWishlist = (product) => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setWishlistItems((currentItems) => {
            const exists = currentItems.find((item) => item.id === product.id);
            if (exists) {
                return currentItems.filter((item) => item.id !== product.id);
            }
            return [...currentItems, product];
        });
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item.id === productId);
    };

    const clearWishlist = () => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setWishlistItems([]);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                toggleWishlist,
                isInWishlist,
                clearWishlist,
                wishlistCount: wishlistItems.length
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }
    return context;
};
