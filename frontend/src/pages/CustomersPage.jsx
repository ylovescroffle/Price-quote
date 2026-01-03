import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { customersAPI } from '../services/api';
import CustomerForm from '../components/CustomerForm';

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        await customersAPI.delete(id);
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const getTierBadge = (tier) => {
    const tierMap = {
      standard: { text: 'Thường', class: 'badge-info' },
      premium: { text: 'Cao cấp', class: 'badge-warning' },
      vip: { text: 'VIP', class: 'badge-success' }
    };

    const tierInfo = tierMap[tier] || { text: tier, class: 'badge-info' };
    return <span className={`badge ${tierInfo.class}`}>{tierInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Quản lý Khách hàng</h2>
          <p className="page-description">Quản lý thông tin và phân loại khách hàng</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedCustomer(null);
            setShowForm(true);
          }}
        >
          <Plus size={20} />
          Thêm khách hàng mới
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Tên khách hàng</th>
              <th>Công ty</th>
              <th>Liên hệ</th>
              <th>Hạng</th>
              <th>Chiết khấu</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.name}</strong></td>
                <td>{customer.company || '-'}</td>
                <td>
                  <div style={{ fontSize: '0.9rem' }}>
                    {customer.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} style={{ color: 'var(--text-secondary)' }} />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td>{getTierBadge(customer.customer_tier)}</td>
                <td><strong style={{ color: 'var(--pink-rose)' }}>{customer.discount_rate}%</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowForm(true);
                      }}
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem', borderColor: 'var(--pink-rose)', color: 'var(--pink-rose)' }}
                      onClick={() => handleDelete(customer.id)}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Chưa có khách hàng nào. Hãy thêm khách hàng mới!
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          onClose={() => {
            setShowForm(false);
            setSelectedCustomer(null);
          }}
          onSave={() => {
            loadCustomers();
            setShowForm(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

export default CustomersPage;
