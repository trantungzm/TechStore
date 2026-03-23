-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS techstore;
USE techstore;

-- =========================
-- USER MODULE
-- =========================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  token TEXT,
  expired_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- PRODUCT MODULE
-- =========================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  description TEXT,
  category_id INT,
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  image_url TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  variant_name VARCHAR(255),
  price DECIMAL(10,2),
  stock INT,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE product_tag_map (
  product_id INT,
  tag_id INT,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (tag_id) REFERENCES product_tags(id)
);

-- =========================
-- CART MODULE
-- =========================
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- ORDER MODULE
-- =========================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_price DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =========================
-- PAYMENT MODULE
-- =========================
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  payment_method VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT,
  transaction_code VARCHAR(255),
  status VARCHAR(50),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- =========================
-- REVIEW MODULE
-- =========================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE review_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT,
  image_url TEXT,
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);

-- =========================
-- PROMOTION MODULE
-- =========================
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50),
  discount DECIMAL(10,2),
  expired_at DATETIME
);

CREATE TABLE coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT,
  user_id INT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- ANALYTICS MODULE
-- =========================
CREATE TABLE product_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  keyword VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =========================
-- SPECIFICATIONS (Thông số động)
-- =========================
CREATE TABLE specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE product_specifications (
  product_id INT,
  spec_id INT,
  value VARCHAR(255),
  PRIMARY KEY (product_id, spec_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (spec_id) REFERENCES specifications(id)
);

-- =========================
-- SERIAL / IMEI MANAGEMENT
-- =========================
CREATE TABLE product_serials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  serial_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =========================
-- WARRANTY SYSTEM
-- =========================
CREATE TABLE warranties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serial_number VARCHAR(100),
  user_id INT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- SUPPORT TICKETS
-- =========================
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- INSTALLMENT (TRẢ GÓP)
-- =========================
CREATE TABLE installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  months INT,
  monthly_payment DECIMAL(10,2),
  interest_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =========================
-- RELATED PRODUCTS (Cross-sell)
-- =========================
CREATE TABLE related_products (
  product_id INT,
  related_product_id INT,
  PRIMARY KEY (product_id, related_product_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (related_product_id) REFERENCES products(id)
);

-- =========================
-- INDEX (TỐI ƯU THÊM)
-- =========================
CREATE INDEX idx_spec_product ON product_specifications(product_id);
CREATE INDEX idx_serial_product ON product_serials(product_id);
CREATE INDEX idx_warranty_serial ON warranties(serial_number);
CREATE INDEX idx_ticket_user ON tickets(user_id);
-- =========================
-- INDEX (TỐI ƯU)
-- =========================
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_user ON orders(user_id);
