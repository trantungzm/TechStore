import { useEffect, useState } from 'react';
import { couponApi } from '../services/api';

let cachedCoupons = null;
let inflightRequest = null;

const normalizeDiscountType = (value) => {
    const key = String(value || '').toLowerCase();
    if (key === 'amount') return 'fixed';
    if (key === 'freeshipping') return 'freeship';
    return key || 'fixed';
};

const normalizeCouponType = (value) => String(value || '').toLowerCase() === 'shipping' ? 'shipping' : 'product';

const normalizeScope = (scopes = []) => {
    const productIds = scopes.filter((s) => s.productId != null).map((s) => String(s.productId));
    const categoryIds = scopes.filter((s) => s.categoryId != null).map((s) => String(s.categoryId));
    const brands = scopes.filter((s) => s.brand).map((s) => String(s.brand));

    return { productIds, categoryIds, brands };
};

export const normalizePublicCoupon = (coupon) => {
    const scopes = Array.isArray(coupon?.scopes) ? coupon.scopes : [];
    const scope = normalizeScope(scopes);
    const couponType = normalizeCouponType(coupon?.type);

    const appliesTo = (() => {
        if (couponType === 'shipping') return 'shipping';
        if (scope.productIds.length) return 'product';
        if (scope.categoryIds.length || scope.brands.length) return 'scoped';
        return 'all';
    })();

    return {
        id: String(coupon?.id ?? coupon?.code ?? ''),
        apiId: coupon?.id,
        code: coupon?.code || '',
        title: coupon?.name || coupon?.code || '',
        description: coupon?.description || '',
        couponType,
        discountType: normalizeDiscountType(coupon?.discountType),
        value: Number(coupon?.discountValue || 0),
        maxDiscount: coupon?.maxDiscountAmount ?? null,
        minOrder: Number(coupon?.minOrderAmount || 0),
        appliesTo,
        categories: scope.categoryIds,
        brands: scope.brands,
        productIds: scope.productIds,
        isProductScoped: scope.productIds.length > 0,
        primaryScopeType: scopes[0]?.scopeType || 'All',
        claimType: coupon?.isSpinReward ? 'spin' : (coupon?.isAutoClaimable === false ? 'condition' : 'instant'),
        unlockCondition: { type: 'none' },
        usageLimit: Number(coupon?.totalQuantity || 0),
        usedCount: Number(coupon?.claimedQuantity || 0),
        expiresAt: coupon?.endAt ? String(coupon.endAt).slice(0, 10) : '',
        isActive: Boolean(coupon?.isActive),
        isSpinReward: Boolean(coupon?.isSpinReward),
        spinEnabled: Boolean(coupon?.isSpinReward),
        spinWeight: Number(coupon?.spinWeight || 0),
        scopes,
        raw: coupon,
    };
};

const readItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    return payload?.items || payload?.data || [];
};

const loadCoupons = async () => {
    if (cachedCoupons) return cachedCoupons;
    if (!inflightRequest) {
        inflightRequest = couponApi
            .getPublic({ page: 1, pageSize: 100, isActive: true })
            .then((response) => readItems(response.data).map(normalizePublicCoupon))
            .finally(() => {
                inflightRequest = null;
            });
    }
    cachedCoupons = await inflightRequest;
    return cachedCoupons;
};

export const usePublicCoupons = () => {
    const [coupons, setCoupons] = useState(() => cachedCoupons || []);
    const [loading, setLoading] = useState(!cachedCoupons);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        loadCoupons()
            .then((items) => {
                if (!active) return;
                setCoupons(items);
                setError(null);
            })
            .catch((err) => {
                if (!active) return;
                setError(err);
                setCoupons([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return { coupons, loading, error };
};

export default usePublicCoupons;
