const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock,
        c.name AS category,
        MIN(pi.image_url) AS image_url
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      GROUP BY p.id, p.name, p.price, p.description, p.stock, c.name
      ORDER BY p.id ASC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load products",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
