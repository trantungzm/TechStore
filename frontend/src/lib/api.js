async function requestJSON(path, options = {}) {
  const response = await fetch(path, options);
  if (!response.ok) {
    throw new Error(`Cannot load ${path}: ${response.status}`);
  }
  return response.json();
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      search.set(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getProducts(params = {}) {
  return requestJSON(`/api/products${buildQuery(params)}`);
}

export function getProductById(id) {
  return requestJSON(`/api/products/${id}`);
}

export function getFeaturedProducts() {
  return requestJSON("/api/featured-products");
}

export function getStats() {
  return requestJSON("/api/stats");
}

export function getCart(userId = 2) {
  return requestJSON(`/api/cart/${userId}`);
}

export function getCoupons() {
  return requestJSON("/api/coupons");
}

export function getOrders() {
  return requestJSON("/api/orders");
}

export function getOrderDetail(orderId) {
  return requestJSON(`/api/orders/${orderId}`);
}

export function getReviews() {
  return requestJSON("/api/reviews");
}

export function getProfile(userId = 2) {
  return requestJSON(`/api/profile/${userId}`);
}

export function getRecommendations(userId = 2) {
  return requestJSON(`/api/recommendations/${userId}`);
}

export function getPayments() {
  return requestJSON("/api/payments");
}

export function getSupportTickets() {
  return requestJSON("/api/support-tickets");
}

export function getInstallments() {
  return requestJSON("/api/installments");
}

export function getWarranties() {
  return requestJSON("/api/warranties");
}

export function addCartItem(userId, productId, quantity = 1) {
  return requestJSON(`/api/cart/${userId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(userId, itemId, quantity) {
  return requestJSON(`/api/cart/${userId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(userId, itemId) {
  return requestJSON(`/api/cart/${userId}/items/${itemId}`, {
    method: "DELETE",
  });
}

export function checkout(userId, payload) {
  return requestJSON(`/api/checkout/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
