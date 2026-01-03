import { Package, FileText, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productsAPI, quotesAPI, customersAPI } from '../services/api';

function HomePage() {
  const [stats, setStats] = useState({
    products: 0,
    quotes: 0,
    customers: 0,
    revenue: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, quotesRes, customersRes] = await Promise.all([
        productsAPI.getAll(),
        quotesAPI.getAll(),
        customersAPI.getAll()
      ]);

      const revenue = quotesRes.data
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + q.total, 0);

      setStats({
        products: productsRes.data.length,
        quotes: quotesRes.data.length,
        customers: customersRes.data.length,
        revenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Trang chủ</h2>
        <p className="page-description">Tổng quan hệ thống quản lý báo giá</p>
      </div>

      <div className="grid grid-4">
        <div className="card" style={{ borderLeft: '4px solid var(--green-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'var(--green-light)',
              borderRadius: '50%',
              color: 'var(--white)'
            }}>
              <Package size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--green-dark)' }}>
                {stats.products}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>Sản phẩm</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--pink-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'var(--pink-primary)',
              borderRadius: '50%',
              color: 'var(--white)'
            }}>
              <FileText size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--pink-rose)' }}>
                {stats.quotes}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>Báo giá</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--earth-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'var(--earth-primary)',
              borderRadius: '50%',
              color: 'var(--white)'
            }}>
              <Users size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--earth-dark)' }}>
                {stats.customers}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>Khách hàng</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--green-sage)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'var(--green-sage)',
              borderRadius: '50%',
              color: 'var(--white)'
            }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--green-dark)' }}>
                {formatCurrency(stats.revenue)}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>Doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }} className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Giới thiệu hệ thống</h3>
          </div>
          <div style={{ lineHeight: '1.8' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>Hệ thống CPQ (Configure, Price, Quote)</strong> giúp bạn quản lý:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>📦 Sản phẩm với nhiều biến thể (kích thước, giai đoạn, đóng gói)</li>
              <li>💰 Giá động từ nhiều nguồn (thu thập tự động hoặc nhập thủ công)</li>
              <li>📄 Báo giá nhanh chóng và chính xác</li>
              <li>👥 Quản lý khách hàng và lịch sử giao dịch</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Tính năng nổi bật</h3>
          </div>
          <div style={{ lineHeight: '1.8' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--green-primary)' }}>✓</strong> Thu thập giá từ Shopee và các website khác
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--green-primary)' }}>✓</strong> Quản lý biến thể sản phẩm đa dạng
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--green-primary)' }}>✓</strong> Tạo báo giá tự động với giá tốt nhất
            </div>
            <div>
              <strong style={{ color: 'var(--green-primary)' }}>✓</strong> Giao diện thân thiện bằng tiếng Việt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
