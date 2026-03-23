USE techstore;

-- =========================
-- USERS
-- =========================
INSERT INTO users (name, email, password, phone, role)
VALUES 
('Admin', 'admin@gmail.com', '123456', '0123456789', 'admin'),
('User A', 'user1@gmail.com', '123456', '0987654321', 'user'),
('User B', 'user2@gmail.com', '123456', '0911222333', 'user');

-- =========================
-- ADDRESSES
-- =========================
INSERT INTO addresses (user_id, address)
VALUES 
(2, 'Hà Nội'),
(3, 'TP Hồ Chí Minh');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name)
VALUES 
('Phone'),
('Laptop'),
('Accessory');

-- =========================
-- PRODUCTS
-- =========================
INSERT INTO products (name, price, description, category_id, stock)
VALUES
('iPhone 15', 25000000, 'Apple smartphone', 1, 10),
('Samsung S23', 20000000, 'Samsung flagship', 1, 15),
('MacBook Pro', 35000000, 'Apple laptop', 2, 5),
('Dell XPS 13', 30000000, 'Dell laptop', 2, 7),
('AirPods Pro', 5000000, 'Apple earphone', 3, 20);

-- =========================
-- PRODUCT IMAGES
-- =========================
INSERT INTO product_images (product_id, image_url)
VALUES
(1, 'iphone.jpg'),
(2, 'samsung.jpg'),
(3, 'macbook.jpg'),
(4, 'dell.jpg'),
(5, 'airpods.jpg');

-- =========================
-- PRODUCT VARIANTS
-- =========================
INSERT INTO product_variants (product_id, variant_name, price, stock)
VALUES
(1, '128GB', 25000000, 5),
(1, '256GB', 28000000, 5),
(3, 'M1 - 8GB RAM', 35000000, 3),
(3, 'M1 - 16GB RAM', 40000000, 2);

-- =========================
-- PRODUCT TAGS
-- =========================
INSERT INTO product_tags (name)
VALUES
('Hot'),
('Sale'),
('New');

INSERT INTO product_tag_map (product_id, tag_id)
VALUES
(1,1),
(1,3),
(2,2),
(3,1);

-- =========================
-- CART
-- =========================
INSERT INTO carts (user_id)
VALUES (2), (3);

INSERT INTO cart_items (cart_id, product_id, quantity, price)
VALUES
(1,1,1,25000000),
(1,5,2,5000000),
(2,3,1,35000000);

-- =========================
-- ORDERS
-- =========================
INSERT INTO orders (user_id, total_price, status)
VALUES
(2, 35000000, 'pending'),
(3, 30000000, 'completed');

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES
(1,1,1,25000000),
(1,5,2,5000000),
(2,4,1,30000000);

INSERT INTO order_status_history (order_id, status)
VALUES
(1,'pending'),
(1,'shipping'),
(2,'completed');

-- =========================
-- PAYMENTS
-- =========================
INSERT INTO payments (order_id, payment_method, amount, status)
VALUES
(1,'COD',35000000,'pending'),
(2,'BANK',30000000,'completed');

INSERT INTO transactions (payment_id, transaction_code, status)
VALUES
(2,'TXN123456','success');

-- =========================
-- REVIEWS
-- =========================
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES
(2,1,5,'Sản phẩm rất tốt'),
(3,3,4,'Laptop chạy mượt');

INSERT INTO review_images (review_id, image_url)
VALUES
(1,'review1.jpg'),
(2,'review2.jpg');

-- =========================
-- COUPONS
-- =========================
INSERT INTO coupons (code, discount, expired_at)
VALUES
('SALE10', 10, '2026-12-31'),
('SALE20', 20, '2026-12-31');

INSERT INTO coupon_usage (coupon_id, user_id)
VALUES
(1,2);

-- =========================
-- ANALYTICS
-- =========================
INSERT INTO product_views (user_id, product_id)
VALUES
(2,1),
(2,3),
(3,2);

INSERT INTO search_history (user_id, keyword)
VALUES
(2,'iPhone'),
(3,'Laptop');

INSERT INTO logs (action, user_id)
VALUES
('login',2),
('add_to_cart',2),
('order',3);