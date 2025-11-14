import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>POS System</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/pos" className="nav-link">
            Point of Sale
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
          <NavLink to="/sales" className="nav-link">
            Sales History
          </NavLink>
          <NavLink to="/customers" className="nav-link">
            Customers
          </NavLink>
          <NavLink to="/reports" className="nav-link">
            Reports
          </NavLink>
          <NavLink to="/settings" className="nav-link">
            Settings
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
