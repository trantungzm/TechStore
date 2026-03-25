import { useEffect, useState } from "react";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!ignore) {
          setProducts(data);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="home-page">
      <section className="hero-section">
        <div>
          <p className="eyebrow">TechStore</p>
          <h1>San pham dang ban tu database MySQL</h1>
          <p className="hero-copy">
            Frontend dang goi API Express va render du lieu that tu Docker MySQL.
          </p>
        </div>
        <div className="hero-stat">
          <span>{products.length}</span>
          <p>san pham dang san sang</p>
        </div>
      </section>

      {loading ? <p className="status-panel">Dang tai san pham...</p> : null}
      {error ? <p className="status-panel error-panel">Loi: {error}</p> : null}

      {!loading && !error ? (
        <section className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-media">
                <span>{product.category || "General"}</span>
              </div>
              <div className="product-body">
                <h2>{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <strong>{Number(product.price).toLocaleString("vi-VN")} VND</strong>
                  <span>Kho: {product.stock}</span>
                </div>
                <p className="product-image-name">
                  Anh du lieu: {product.image_url || "Khong co"}
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default Home;
