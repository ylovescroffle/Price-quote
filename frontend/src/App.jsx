import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, FileText, Users, Home } from 'lucide-react';
import ProductsPage from './pages/ProductsPage';
import QuotesPage from './pages/QuotesPage';
import CustomersPage from './pages/CustomersPage';
import HomePage from './pages/HomePage';
import './styles/theme.css';
import './styles/App.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="nav">
      <ul className="nav-links">
        <li>
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            <Home size={20} />
            Trang chủ
          </Link>
        </li>
        <li>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>
            <Package size={20} />
            Sản phẩm
          </Link>
        </li>
        <li>
          <Link to="/quotes" className={`nav-link ${isActive('/quotes')}`}>
            <FileText size={20} />
            Báo giá
          </Link>
        </li>
        <li>
          <Link to="/customers" className={`nav-link ${isActive('/customers')}`}>
            <Users size={20} />
            Khách hàng
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>🌿 Hệ Thống Báo Giá CPQ</h1>
          <p>Quản lý sản phẩm, giá cả và báo giá một cách dễ dàng</p>
        </header>

        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
