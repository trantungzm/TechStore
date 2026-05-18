import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addCartItem, getProductById } from "../lib/api";

function ProductDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProductById(id)
      .then((rows) => {
        if (!cancelled) {
          setDetail(rows);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart() {
    try {
      await addCartItem(2, id, 1);
      setMessage("Da them vao gio hang.");
    } catch (e) {
      setMessage(`Them gio hang that bai: ${e.message}`);
    }
  }

  if (error) {
    return (
      <main className="screen-page">
        <p className="status-panel error-panel">{error}</p>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className="screen-page">
        <p className="status-panel">Dang tai chi tiet...</p>
      </main>
    );
  }

  return (
    <main className="screen-page detail-layout">
      <section className="detail-main store-card">
        <h2>{detail.name}</h2>
        <p>{detail.description}</p>
        <p className="muted-line">Danh muc: {detail.category || "General"}</p>
        <p className="muted-line">Tags: {detail.tags || "none"}</p>
        <p className="price-line">{Number(detail.price).toLocaleString("vi-VN")} VND</p>

        <h3 className="section-title small">Anh san pham</h3>
        <div className="chip-row">
          {(detail.images || []).map((img, index) => (
            <span key={`${img.image_url}-${index}`} className="chip">
              {img.image_url}
            </span>
          ))}
        </div>

        <h3 className="section-title small">Phien ban</h3>
        <div className="chip-row">
          {(detail.variants || []).map((variant, index) => (
            <span className="chip" key={`${variant.variant_name}-${index}`}>
              {variant.variant_name} - {Number(variant.price).toLocaleString("vi-VN")} VND
            </span>
          ))}
        </div>

        <h3 className="section-title small">Thong so ky thuat</h3>
        <ul className="spec-list">
          {(detail.specifications || []).map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <span>{item.name}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>

        <h3 className="section-title small">Danh gia</h3>
        {(detail.reviews || []).map((review, index) => (
          <p key={`${review.user_name}-${index}`}>
            {review.user_name}: {review.rating}/5 - {review.comment}
          </p>
        ))}

        <div className="button-row">
          <button className="btn-primary" type="button" onClick={handleAddToCart}>
            Them vao gio
          </button>
          <Link className="btn-ghost" to="/cart">
            Xem gio hang
          </Link>
        </div>
        {message ? <p className="status-panel">{message}</p> : null}
      </section>

      <aside className="detail-side">
        <section className="store-card">
          <h3 className="section-title small">San pham lien quan</h3>
          {(detail.related_products || []).map((item) => (
            <p key={item.id}>
              <Link className="link-inline" to={`/products/${item.id}`}>
                {item.name}
              </Link>
            </p>
          ))}
        </section>
      </aside>
    </main>
  );
}

export default ProductDetailPage;
