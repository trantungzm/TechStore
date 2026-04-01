const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function runQuery(res, query, params = []) {
  try {
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    res.status(500).json({
      message: "Database query failed",
      error: error.message,
    });
    return null;
  }
}

async function getOrCreateCartId(connection, userId) {
  const [rows] = await connection.query("SELECT id FROM carts WHERE user_id = ? LIMIT 1", [userId]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await connection.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return result.insertId;
}

app.get("/", (req, res) => {
  res.json({
    message: "TechStore API running...",
  });
});

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [[usersRow]] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [[productsRow]] = await db.query("SELECT COUNT(*) AS total FROM products");

    res.json({
      users: usersRow.total,
      products: productsRow.total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load database stats",
      error: error.message,
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { q, category, tag } = req.query;
    const whereClauses = [];
    const params = [];

    if (q) {
      whereClauses.push("p.name LIKE ?");
      params.push(`%${q}%`);
    }
    if (category && category !== "all") {
      whereClauses.push("c.name = ?");
      params.push(category);
    }
    if (tag && tag !== "all") {
      whereClauses.push(
        "EXISTS (SELECT 1 FROM product_tag_map x JOIN product_tags t ON t.id = x.tag_id WHERE x.product_id = p.id AND t.name = ?)",
      );
      params.push(tag);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const [rows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock,
        c.name AS category,
        MIN(pi.image_url) AS image_url,
        GROUP_CONCAT(DISTINCT pt.name ORDER BY pt.name SEPARATOR ", ") AS tags
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_tag_map ptm ON ptm.product_id = p.id
      LEFT JOIN product_tags pt ON pt.id = ptm.tag_id
      ${whereSQL}
      GROUP BY p.id, p.name, p.price, p.description, p.stock, c.name
      ORDER BY p.id ASC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
      error: error.message,
    });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [productRows] = await db.query(
      `
        SELECT
          p.id,
          p.name,
          p.price,
          p.description,
          p.stock,
          c.name AS category,
          MIN(pi.image_url) AS image_url,
          GROUP_CONCAT(DISTINCT pt.name ORDER BY pt.name SEPARATOR ", ") AS tags
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN product_images pi ON pi.product_id = p.id
        LEFT JOIN product_tag_map ptm ON ptm.product_id = p.id
        LEFT JOIN product_tags pt ON pt.id = ptm.tag_id
        WHERE p.id = ?
        GROUP BY p.id, p.name, p.price, p.description, p.stock, c.name
      `,
      [req.params.id],
    );

    if (productRows.length === 0) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const [imagesRows, variantsRows, specsRows, reviewsRows, relatedRows] = await Promise.all([
      db.query("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY id ASC", [req.params.id]),
      db.query(
        "SELECT variant_name, price, stock FROM product_variants WHERE product_id = ? ORDER BY id ASC",
        [req.params.id],
      ),
      db.query(
        `
          SELECT s.name, ps.value
          FROM product_specifications ps
          JOIN specifications s ON s.id = ps.spec_id
          WHERE ps.product_id = ?
        `,
        [req.params.id],
      ),
      db.query(
        `
          SELECT u.name AS user_name, r.rating, r.comment, r.created_at
          FROM reviews r
          JOIN users u ON u.id = r.user_id
          WHERE r.product_id = ?
          ORDER BY r.id DESC
        `,
        [req.params.id],
      ),
      db.query(
        `
          SELECT p.id, p.name, p.price
          FROM related_products rp
          JOIN products p ON p.id = rp.related_product_id
          WHERE rp.product_id = ?
          LIMIT 5
        `,
        [req.params.id],
      ),
    ]);

    res.json({
      ...productRows[0],
      images: imagesRows[0],
      variants: variantsRows[0],
      specifications: specsRows[0],
      reviews: reviewsRows[0],
      related_products: relatedRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load product detail",
      error: error.message,
    });
  }
});

app.get("/api/featured-products", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock,
        c.name AS category,
        MIN(pi.image_url) AS image_url,
        COUNT(DISTINCT pv.id) AS views,
        GROUP_CONCAT(DISTINCT pt.name ORDER BY pt.name SEPARATOR ", ") AS tags
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_views pv ON pv.product_id = p.id
      LEFT JOIN product_tag_map ptm ON ptm.product_id = p.id
      LEFT JOIN product_tags pt ON pt.id = ptm.tag_id
      GROUP BY p.id, p.name, p.price, p.description, p.stock, c.name
      ORDER BY views DESC, p.id ASC
      LIMIT 8
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/cart/:userId", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        ci.id,
        p.id AS product_id,
        p.name,
        ci.price,
        ci.quantity,
        MIN(pi.image_url) AS image_url
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products p ON p.id = ci.product_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE c.user_id = ?
      GROUP BY ci.id, p.id, p.name, ci.price, ci.quantity
      ORDER BY ci.id ASC
    `,
    [req.params.userId],
  );
  if (!rows) return;
  res.json(rows);
});

app.post("/api/cart/:userId/items", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.body.productId);
    const quantity = Math.max(1, Number(req.body.quantity || 1));

    if (!Number.isFinite(userId) || !Number.isFinite(productId)) {
      res.status(400).json({ message: "Invalid user or product id" });
      return;
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const cartId = await getOrCreateCartId(connection, userId);
      const [productRows] = await connection.query(
        "SELECT id, price FROM products WHERE id = ? LIMIT 1",
        [productId],
      );
      if (productRows.length === 0) {
        await connection.rollback();
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const [existingRows] = await connection.query(
        "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
        [cartId, productId],
      );

      if (existingRows.length > 0) {
        await connection.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [
          quantity,
          existingRows[0].id,
        ]);
      } else {
        await connection.query(
          "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [cartId, productId, quantity, productRows[0].price],
        );
      }

      await connection.commit();
      res.status(201).json({ message: "Added to cart" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to add cart item", error: error.message });
  }
});

app.put("/api/cart/:userId/items/:itemId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const itemId = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      res.status(400).json({ message: "Quantity must be >= 1" });
      return;
    }

    const [rows] = await db.query(
      `
        UPDATE cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        SET ci.quantity = ?
        WHERE ci.id = ? AND c.user_id = ?
      `,
      [quantity, itemId, userId],
    );

    if (rows.affectedRows === 0) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    res.json({ message: "Cart item updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart item", error: error.message });
  }
});

app.delete("/api/cart/:userId/items/:itemId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const itemId = Number(req.params.itemId);
    const [rows] = await db.query(
      `
        DELETE ci
        FROM cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        WHERE ci.id = ? AND c.user_id = ?
      `,
      [itemId, userId],
    );

    if (rows.affectedRows === 0) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    res.json({ message: "Cart item removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove cart item", error: error.message });
  }
});

app.get("/api/coupons", async (req, res) => {
  const rows = await runQuery(
    res,
    "SELECT id, code, discount, expired_at FROM coupons ORDER BY id ASC",
  );
  if (!rows) return;
  res.json(rows);
});

app.post("/api/checkout/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const { address, couponCode, paymentMethod } = req.body;

  if (!Number.isFinite(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const cartId = await getOrCreateCartId(connection, userId);
    const [cartItems] = await connection.query(
      "SELECT product_id, quantity, price FROM cart_items WHERE cart_id = ?",
      [cartId],
    );
    if (cartItems.length === 0) {
      await connection.rollback();
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    let subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    let discountPercent = 0;
    let couponId = null;

    if (couponCode) {
      const [couponRows] = await connection.query(
        "SELECT id, discount FROM coupons WHERE code = ? LIMIT 1",
        [couponCode],
      );
      if (couponRows.length > 0) {
        couponId = couponRows[0].id;
        discountPercent = Number(couponRows[0].discount) || 0;
      }
    }

    const finalTotal = Math.max(0, subtotal - subtotal * (discountPercent / 100));

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
      [userId, finalTotal, "pending"],
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price],
      );
    }

    await connection.query(
      "INSERT INTO order_status_history (order_id, status) VALUES (?, ?)",
      [orderId, "pending"],
    );

    const [paymentResult] = await connection.query(
      "INSERT INTO payments (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)",
      [orderId, paymentMethod || "COD", finalTotal, "pending"],
    );

    await connection.query(
      "INSERT INTO transactions (payment_id, transaction_code, status) VALUES (?, ?, ?)",
      [paymentResult.insertId, `TXN-${Date.now()}`, "pending"],
    );

    if (couponId) {
      await connection.query(
        "INSERT INTO coupon_usage (coupon_id, user_id) VALUES (?, ?)",
        [couponId, userId],
      );
    }

    if (address) {
      await connection.query("INSERT INTO addresses (user_id, address) VALUES (?, ?)", [
        userId,
        address,
      ]);
    }

    await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    await connection.commit();

    res.status(201).json({
      message: "Checkout success",
      order_id: orderId,
      subtotal,
      discount_percent: discountPercent,
      final_total: finalTotal,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Checkout failed", error: error.message });
  } finally {
    connection.release();
  }
});

app.get("/api/orders", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        o.id,
        o.total_price AS total,
        o.status,
        o.created_at AS created_at,
        u.name AS user_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/orders/:id", async (req, res) => {
  const [orderRows, itemsRows, timelineRows] = await Promise.all([
    runQuery(
      res,
      `
        SELECT
          o.id,
          o.total_price AS total,
          o.status,
          o.created_at AS created_at,
          u.name AS user_name
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
      `,
      [req.params.id],
    ),
    runQuery(
      res,
      `
        SELECT
          oi.id,
          p.name,
          oi.quantity,
          oi.price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
      `,
      [req.params.id],
    ),
    runQuery(
      res,
      `
        SELECT status, created_at
        FROM order_status_history
        WHERE order_id = ?
        ORDER BY id ASC
      `,
      [req.params.id],
    ),
  ]);

  if (!orderRows || !itemsRows || !timelineRows) return;
  if (orderRows.length === 0) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({
    order: orderRows[0],
    items: itemsRows,
    timeline: timelineRows,
  });
});

app.get("/api/reviews", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        r.id,
        u.name AS user_name,
        p.name AS product_name,
        r.rating,
        r.comment,
        r.created_at,
        MIN(ri.image_url) AS image_url
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN products p ON p.id = r.product_id
      LEFT JOIN review_images ri ON ri.review_id = r.id
      GROUP BY r.id, u.name, p.name, r.rating, r.comment, r.created_at
      ORDER BY r.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/profile/:userId", async (req, res) => {
  const userRows = await runQuery(
    res,
    "SELECT id, name, email, phone, role FROM users WHERE id = ?",
    [req.params.userId],
  );
  if (!userRows) return;
  if (userRows.length === 0) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const addresses = await runQuery(
    res,
    "SELECT id, address FROM addresses WHERE user_id = ? ORDER BY id ASC",
    [req.params.userId],
  );
  if (!addresses) return;

  res.json({
    ...userRows[0],
    addresses,
  });
});

app.get("/api/recommendations/:userId", async (req, res) => {
  const [viewedRows, searchRows] = await Promise.all([
    runQuery(
      res,
      `
        SELECT p.id, p.name, pv.viewed_at
        FROM product_views pv
        JOIN products p ON p.id = pv.product_id
        WHERE pv.user_id = ?
        ORDER BY pv.viewed_at DESC
        LIMIT 10
      `,
      [req.params.userId],
    ),
    runQuery(
      res,
      `
        SELECT keyword, created_at
        FROM search_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `,
      [req.params.userId],
    ),
  ]);

  if (!viewedRows || !searchRows) return;
  res.json({
    viewed_products: viewedRows,
    search_history: searchRows,
  });
});

app.get("/api/payments", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        p.id,
        p.order_id,
        p.payment_method,
        p.amount,
        p.status,
        t.transaction_code
      FROM payments p
      LEFT JOIN transactions t ON t.payment_id = p.id
      ORDER BY p.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/support-tickets", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        t.id,
        t.subject,
        t.message,
        t.status,
        t.created_at,
        u.name AS user_name
      FROM tickets t
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/installments", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        i.id,
        i.order_id,
        i.months,
        i.monthly_payment,
        i.interest_rate,
        i.created_at
      FROM installments i
      ORDER BY i.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.get("/api/warranties", async (req, res) => {
  const rows = await runQuery(
    res,
    `
      SELECT
        w.id,
        w.serial_number,
        w.start_date,
        w.end_date,
        w.status,
        u.name AS user_name
      FROM warranties w
      LEFT JOIN users u ON u.id = w.user_id
      ORDER BY w.id DESC
    `,
  );
  if (!rows) return;
  res.json(rows);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
