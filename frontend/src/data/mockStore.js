export const mockOrders = [
  { id: 1001, total: 35000000, status: "shipping", createdAt: "2026-03-21" },
  { id: 1002, total: 30000000, status: "completed", createdAt: "2026-03-19" },
];

export const mockOrderItems = [
  { orderId: 1001, name: "iPhone 15", price: 25000000, quantity: 1 },
  { orderId: 1001, name: "AirPods Pro", price: 5000000, quantity: 2 },
  { orderId: 1002, name: "Dell XPS 13", price: 30000000, quantity: 1 },
];

export const orderTimeline = {
  1001: ["pending", "confirmed", "shipping"],
  1002: ["pending", "confirmed", "shipping", "completed"],
};

export const cartItems = [
  { id: 1, name: "iPhone 15", price: 25000000, quantity: 1, image: "iphone.jpg" },
  { id: 5, name: "AirPods Pro", price: 5000000, quantity: 2, image: "airpods.jpg" },
];

export const coupons = [
  { code: "SALE10", discount: "10%", expiredAt: "2026-12-31" },
  { code: "SALE20", discount: "20%", expiredAt: "2026-12-31" },
];

export const reviews = [
  { user: "User A", rating: 5, comment: "San pham rat tot", image: "review1.jpg" },
  { user: "User B", rating: 4, comment: "Dung on dinh, giao hang nhanh", image: "review2.jpg" },
];

export const recentTracking = {
  viewedProducts: ["iPhone 15", "MacBook Pro", "Samsung S23"],
  searchKeywords: ["iPhone", "Laptop", "Tai nghe"],
};

export const supportTickets = [
  { id: "T001", title: "Bao hanh iPhone", content: "Kiem tra serial bi loi", status: "open" },
  { id: "T002", title: "Don hang tre", content: "Cap nhat van chuyen", status: "processing" },
];

export const installmentPlans = [
  { months: 6, monthly: 4500000, interest: "1.2%" },
  { months: 12, monthly: 2300000, interest: "1.8%" },
  { months: 18, monthly: 1600000, interest: "2.1%" },
];

export const warranties = [
  { serial: "IP15-001", period: "2026-01-01 -> 2027-01-01", status: "active" },
  { serial: "MBP-002", period: "2025-10-01 -> 2026-10-01", status: "active" },
];
