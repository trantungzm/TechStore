import { safeParseJson } from './store';

// Lưu trạng thái đơn hàng người dùng "đã xem" để phát hiện khi shop đổi trạng thái.
const SEEN_KEY = 'seen_order_statuses';

export const getSeenOrderStatuses = () => safeParseJson(localStorage.getItem(SEEN_KEY) || '{}', {});

// Đánh dấu đã xem toàn bộ trạng thái hiện tại (gọi khi mở trang đơn hàng).
export const markOrdersSeen = (orders = []) => {
    const map = {};
    orders.forEach((o) => {
        const id = o?.id ?? o?.Id;
        if (id != null) map[id] = o?.status ?? o?.Status ?? '';
    });
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('orders:seen'));
};

// Một đơn được coi là "có cập nhật chưa xem" nếu đã từng thấy trước đó và trạng thái nay khác đi.
export const isOrderUnseen = (order, seen = getSeenOrderStatuses()) => {
    const id = order?.id ?? order?.Id;
    if (id == null) return false;
    const prev = seen[id];
    return prev !== undefined && prev !== (order?.status ?? order?.Status ?? '');
};

export const countUnseenOrderUpdates = (orders = [], seen = getSeenOrderStatuses()) =>
    orders.filter((o) => isOrderUnseen(o, seen)).length;
