import { useEffect, useMemo, useState } from "react";
import { checkout, getCart, getCoupons } from "../lib/api";

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [address, setAddress] = useState("123 Nguyen Trai, TP HCM");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function loadData() {
    try {
      const [cartRows, couponRows] = await Promise.all([getCart(2), getCoupons()]);
      setCartItems(cartRows);
      setCoupons(couponRows);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const couponRows = useMemo(
    () => coupons.map((coupon) => ({ ...coupon, expiredAt: String(coupon.expired_at).slice(0, 10) })),
    [coupons],
  );

  async function handleCheckout() {
    try {
      const payload = {
        address,
        couponCode: selectedCoupon || null,
        paymentMethod,
      };
      const data = await checkout(2, payload);
      setResult(data);
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="screen-page">
      <h2 className="section-title">Trang Checkout</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      {result ? (
        <p className="status-panel">
          Dat hang thanh cong. Order #{result.order_id}, tong thanh toan:{" "}
          {Number(result.final_total).toLocaleString("vi-VN")} VND
        </p>
      ) : null}

      <div className="detail-layout">
        <section className="store-card">
          <h3 className="section-title small">Danh sach san pham</h3>
          {cartItems.map((item) => (
            <p key={item.id}>
              {item.name} x {item.quantity}
            </p>
          ))}
          <p className="price-line">Tong tam tinh: {total.toLocaleString("vi-VN")} VND</p>
        </section>

        <section className="store-card">
          <h3 className="section-title small">Thong tin giao hang va thanh toan</h3>
          <div className="form-grid">
            <label htmlFor="address">Dia chi giao hang</label>
            <input
              id="address"
              className="text-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <label htmlFor="payment-method">Phuong thuc thanh toan</label>
            <select
              id="payment-method"
              className="text-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="COD">COD</option>
              <option value="BANK">BANK</option>
            </select>

            <label htmlFor="coupon-code">Ma giam gia</label>
            <select
              id="coupon-code"
              className="text-input"
              value={selectedCoupon}
              onChange={(e) => setSelectedCoupon(e.target.value)}
            >
              <option value="">Khong su dung</option>
              {couponRows.map((coupon) => (
                <option key={coupon.code} value={coupon.code}>
                  {coupon.code} - {coupon.discount}% (Han {coupon.expiredAt})
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" type="button" onClick={handleCheckout} disabled={!cartItems.length}>
            Dat hang
          </button>
        </section>
      </div>
    </main>
  );
}

export default CheckoutPage;
