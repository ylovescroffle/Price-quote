import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { customersAPI } from '../services/api';

function CustomerForm({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    customer_tier: 'standard',
    discount_rate: 0
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (customer) {
        await customersAPI.update(customer.id, formData);
      } else {
        await customersAPI.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Lỗi khi lưu khách hàng: ' + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">{customer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}</h3>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên khách hàng *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Công ty</label>
            <input
              type="text"
              className="form-input"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <textarea
              className="form-textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows="2"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Hạng khách hàng</label>
              <select
                className="form-select"
                value={formData.customer_tier}
                onChange={(e) => setFormData({ ...formData, customer_tier: e.target.value })}
              >
                <option value="standard">Thường</option>
                <option value="premium">Cao cấp</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tỷ lệ chiết khấu (%)</label>
              <input
                type="number"
                className="form-input"
                value={formData.discount_rate}
                onChange={(e) => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {customer ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;
