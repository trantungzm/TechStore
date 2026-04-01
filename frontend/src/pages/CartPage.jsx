import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, removeCartItem, updateCartItem } from "../lib/api";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function reloadCart() {
    try {
      const rows = await getCart(2);
      setCartItems(rows);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    reloadCart();
  }, []);

  async function handleUpdateQuantity(itemId, quantity) {
    try {
      await updateCartItem(2, itemId, quantity);
      setMessage("Cap nhat gio hang thanh cong.");
      reloadCart();
    } catch (e) {
      setMessage(`Cap nhat that bai: ${e.message}`);
    }
  }

  async function handleDelete(itemId) {
    try {
      await removeCartItem(2, itemId);
      setMessage("Da xoa san pham khoi gio.");
      reloadCart();
    } catch (e) {
      setMessage(`Xoa that bai: ${e.message}`);
    }
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <main className="screen-page">
      <h2 className="section-title">Trang Gio Hang</h2>
      {message ? <p className="status-panel">{message}</p> : null}
      {error ? <p className="status-panel error-panel">{error}</p> : null}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>San pham</th>
              <th>Anh</th>
              <th>Gia</th>
              <th>So luong</th>
              <th>Tong</th>
              <th>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.image_url || "Khong co"}</td>
                <td>{Number(item.price).toLocaleString("vi-VN")} VND</td>
                <td>
                  <div className="qty-row">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td>{(Number(item.price) * item.quantity).toLocaleString("vi-VN")} VND</td>
                <td>
                  <button type="button" onClick={() => handleDelete(item.id)}>
                    Xoa
                  </button>
                </td>
              </tr>
            ))}
            {cartItems.length === 0 ? (
              <tr>
                <td colSpan={6}>Gio hang trong.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="price-line">Tong tien: {total.toLocaleString("vi-VN")} VND</p>
      <Link className="btn-primary" to="/checkout">
        Tiep tuc dat hang
      </Link>
    </main>
  );
}

export default CartPage;
