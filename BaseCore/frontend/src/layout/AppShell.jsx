import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
  { to: "/profile", label: "Profile" },
  { to: "/promotions", label: "Promotions" },
  { to: "/support", label: "Support" },
];

function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-area">
          <p className="brand-mark">TECHSTORE</p>
          <h1></h1>
        </div>
        <nav className="main-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active-link" : "nav-link")}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  );
}

export default AppShell;
