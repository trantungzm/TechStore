import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts, getProducts, getStats } from "../lib/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ users: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [productsData, statsData, featuredData] = await Promise.all([
          getProducts(),
          getStats(),
          getFeaturedProducts(),
        ]);
        if (!cancelled) {
          setProducts(productsData);
          setStats(statsData);
          setFeaturedProducts(featuredData);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))];
  }, [products]); 

  return (
   
    <main className="screen-page">
      <section className="hero-block">
        <div>
          <p className="eyebrow">Trang Chủ</p>
          <h2>Danh sách sản phẩm</h2>
          <p>
             Sản phẩm chính hãng, nguyên máy
          </p>
          <div className="button-row">
            <Link className="btn-primary" to="/products">
              Xem tất cả sản phẩm
            </Link>
            <Link className="btn-ghost" to="/recommendations">
              Hệ thống gợi ý
            </Link>
          </div>
        </div>
        <div className="stats-card">
          <p>Users</p>
          <strong>{stats.users}</strong>
          <p>Products</p>
          <strong>{stats.products || products.length}</strong>
        </div>
      </section>

      {loading ? <p className="status-panel">Đang tải dữ liệu...</p> : null}
      {error ? <p className="status-panel error-panel">{error}</p> : null}

      {!loading && !error ? (
        <>
          <section>
            <h3 className="section-title">Danh mục sản phẩm</h3>
            <div className="chip-row">
              {categories.map((category) => (
                <span key={category} className="chip">
                  {category}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="section-title">Sản phẩm nội bật</h3>
            <div className="card-grid">
              {featuredProducts.map((product) => (
                <article key={product.id} className="store-card">
                  <div className="card-top">
                    <span>{product.category || "General"}</span>
                    <span className="tag-badge">{product.tags || "featured"}</span>
                  </div>
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                  <div className="meta-line">
                    <strong>{Number(product.price).toLocaleString("vi-VN")} VND</strong>
                    <span>{product.views} views</span>
                  </div>
                  <Link to={`/products/${product.id}`} className="link-inline">
                    Xem chi tiết
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default Home;
