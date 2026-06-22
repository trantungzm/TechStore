import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { isStoreViewOnlyUser, STORE_VIEW_ONLY_MESSAGE, toast } from '../utils/store';

const CartContext = createContext(null);
const BASE_STORAGE_KEY = 'store_cart';

export const getCartItemKey = (itemOrProduct) => {
    const product = itemOrProduct?.product || itemOrProduct || {};
    const productId = itemOrProduct?.productId ?? product.productId ?? product.id;
    const variantId = itemOrProduct?.variantId ?? product.variantId ?? product.selectedVariantId;
    return `${productId}:${variantId !== undefined && variantId !== null && variantId !== '' ? `variant:${variantId}` : 'base'}`;
};

// Khoá định danh dòng giỏ hàng (ưu tiên key đã lưu, nếu không thì suy ra từ product/variant).
export const getItemKey = (item) => item.cartItemKey || getCartItemKey(item);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const isViewOnly = isStoreViewOnlyUser(user);
    const storageKey = user ? `${BASE_STORAGE_KEY}_${user.userId}` : `${BASE_STORAGE_KEY}_guest`;

    const [items, setItems] = useState([]);
    const [loadedKey, setLoadedKey] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : [];
        setItems(Array.isArray(parsed) ? parsed.map((item) => ({
            ...item,
            cartItemKey: item.cartItemKey || getCartItemKey(item),
        })) : []);
        setLoadedKey(storageKey);
    }, [storageKey]);

    useEffect(() => {
        if (loadedKey === storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(items));
        }
    }, [items, storageKey, loadedKey]);

    const addItem = (product, quantity = 1) => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setItems((currentItems) => {
            const productId = product.productId || product.id;
            const cartItemKey = getCartItemKey({ productId, product });
            const existing = currentItems.find((item) => (item.cartItemKey || getCartItemKey(item)) === cartItemKey);
            if (existing) {
                return currentItems.map((item) =>
                    (item.cartItemKey || getCartItemKey(item)) === cartItemKey
                        ? { ...item, cartItemKey, quantity: Math.min(item.quantity + quantity, product.stock || item.quantity + quantity) }
                        : item
                );
            }

            return [
                ...currentItems,
                {
                    cartItemKey,
                    productId,
                    variantId: product.variantId ?? null,
                    quantity: Math.min(quantity, product.stock || quantity),
                    product,
                },
            ];
        });
    };

    const updateQuantity = (cartItemKey, quantity) => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setItems((currentItems) =>
            currentItems
                .map((item) => {
                    if ((item.cartItemKey || getCartItemKey(item)) === String(cartItemKey)) {
                        const maxStock = item.product?.stock ?? quantity;
                        const validQuantity = Math.min(Math.max(1, quantity), maxStock);
                        return { ...item, quantity: validQuantity };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (cartItemKey) => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setItems((currentItems) => currentItems.filter((item) => (item.cartItemKey || getCartItemKey(item)) !== String(cartItemKey)));
    };

    const clearCart = () => {
        if (isViewOnly) {
            toast(STORE_VIEW_ONLY_MESSAGE, 'warning');
            return;
        }
        setItems([]);
    };

    const totals = useMemo(() => {
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        const amount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
        return { count, amount };
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                itemCount: totals.count,
                totalAmount: totals.amount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
