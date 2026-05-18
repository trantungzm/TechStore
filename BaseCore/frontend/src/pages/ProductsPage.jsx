import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addCartItem, getProducts } from "../lib/api";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProducts()
      .then((rows) => {
        if (!cancelled) {
          setAllProducts(rows);
        }
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProducts({ q: searchTerm, category, tag })
      .then((rows) => {
        if (!cancelled) {
          setProducts(rows);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchTerm, category, tag]);

  const categories = useMemo(
    () => ["all", ...new Set(allProducts.map((item) => item.category).filter(Boolean))],
    [allProducts],
  );

  const tags = useMemo(() => {
    const values = new Set();
    allProducts.forEach((product) => {
      (product.tags || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.add(item));
    });
    return ["all", ...values];
  }, [allProducts]);

  async function handleAddToCart(productId) {
    try {
      await addCartItem(2, productId, 1);
      setMessage("Da them san pham vao gio hang.");
    } catch (e) {
      setMessage(`Them gio hang that bai: ${e.message}`);
    }
  }

  return (
    <main className="screen-page">
      <h2 className="section-title">Trang Danh Sach San Pham</h2>

      <div className="filter-grid">
        <input
          className="text-input"
          placeholder="Tim theo ten san pham..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="text-input" value={tag} onChange={(e) => setTag(e.target.value)}>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="status-panel">{message}</p> : null}
      {loading ? <p className="status-panel">Dang tai san pham...</p> : null}
      {error ? <p className="status-panel error-panel">{error}</p> : null}

      {!loading && !error ? (
        <div className="card-grid">
          {products.map((product) => (
            <article key={product.id} className="store-card">
              <div className="card-top">
                <span>{product.category || "General"}</span>
                <span className="tag-badge">{product.tags || "none"}</span>
              </div>
              <h4>{product.name}</h4>
              <p>Anh: {product.image_url || "Khong co anh"}</p>
              <div className="meta-line">
                <strong>{Number(product.price).toLocaleString("vi-VN")} VND</strong>
                <span>Kho: {product.stock}</span>
              </div>
              <div className="button-row">
                <Link className="link-inline" to={`/products/${product.id}`}>
                  Xem chi tiet
                </Link>
                <button className="btn-primary" type="button" onClick={() => handleAddToCart(product.id)}>
                  Them vao gio
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}

export default ProductsPage;
