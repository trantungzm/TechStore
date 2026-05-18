import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaymentPage from "./pages/PaymentPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProfilePage from "./pages/ProfilePage";
import PromotionsPage from "./pages/PromotionsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SupportPage from "./pages/SupportPage";
import InstallmentPage from "./pages/InstallmentPage";
import WarrantyPage from "./pages/WarrantyPage";

const quickLinks = [
  { to: "/promotions", label: "Khuyen mai" },
  { to: "/support", label: "Ho tro" },
  { to: "/profile", label: "Tai khoan" },
];

const footerSections = [
  {
    title: "Ve TechStore",
    links: [
      { to: "/", label: "Gioi thieu" },
      { to: "/support", label: "Lien he" },
      { to: "/warranty", label: "Bao hanh" },
    ],
  },
  {
    title: "Khach hang",
    links: [
      { to: "/checkout", label: "Huong dan dat hang" },
      { to: "/orders", label: "Theo doi don hang" },
      { to: "/payment", label: "Thanh toan" },
    ],
  },
];

function App() {
  return (
    <BrowserRouter>
      <div className="site-layout">
        <header className="site-header" id="header">
          <div className="container header-content">
            <Link className="logo" to="/" aria-label="Trang chu TechStore">
              <i className="fas fa-bolt" aria-hidden="true" />
              <span>TechStore</span>
            </Link>

            <label className="search-bar" htmlFor="searchInput">
              <input id="searchInput" type="search" placeholder="Tìm kiếm sản phẩm..." />
              <button type="button" aria-label="Tim kiem">
                <i className="fas fa-search" aria-hidden="true" />
              </button>
            </label>

            <nav className="nav-icons" aria-label="Loi tat">
              {quickLinks.map((item) => (
                <Link key={item.to} to={item.to} className="nav-icon" title={item.label}>
                  {item.label}
                </Link>
              ))}
              <Link to="/cart" className="nav-icon nav-icon-badge" title="Gio hang">
                <i className="fas fa-shopping-cart" aria-hidden="true" />
                <span className="badge">0</span>
              </Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="installment" element={<InstallmentPage />} />
            <Route path="warranty" element={<WarrantyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        <footer className="site-footer">
          <div className="container footer-content">
            <section className="footer-section">
              <h3>
                <i className="fas fa-bolt" aria-hidden="true" /> TechStore
              </h3>
              <p>Cua hang cong nghe voi trai nghiem mua sam don gian.</p>
            </section>

            {footerSections.map((group) => (
              <section key={group.title} className="footer-section">
                <h4>{group.title}</h4>
                <ul>
                  {group.links.map((linkItem) => (
                    <li key={linkItem.to}>
                      <Link to={linkItem.to}>{linkItem.label}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className="footer-section">
              <h4>Lien he</h4>
              <ul>
                <li>Hotline: 1900 xxxx</li>
                <li>Email: support@techstore.vn</li>
                <li>Dia chi: Ha Noi, Viet Nam</li>
              </ul>
            </section>
          </div>
          <p className="footer-bottom">© 2026 TechStore. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
