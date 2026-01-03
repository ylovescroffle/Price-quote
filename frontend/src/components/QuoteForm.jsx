import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { quotesAPI, customersAPI, productsAPI } from '../services/api';

function QuoteForm({ quote, onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    status: 'draft',
    tax_rate: 10,
    valid_until: '',
    notes: ''
  });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    discount_percent: 0
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();

    if (quote) {
      setFormData({
        customer_id: quote.customer_id,
        customer_name: quote.customer_name,
        status: quote.status,
        tax_rate: (quote.tax_rate || 0) * 100,
        valid_until: quote.valid_until ? new Date(quote.valid_until).toISOString().split('T')[0] : '',
        notes: quote.notes || ''
      });
      setItems(quote.items || []);
    }
  }, [quote]);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        customer_name: customer.name
      });
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setNewItem({
        ...newItem,
        product_id: productId,
        unit_price: product.base_price
      });
    }
  };

  const handleAddItem = () => {
    if (!newItem.product_id) return;

    const product = products.find(p => p.id === newItem.product_id);
    const discountAmount = (newItem.unit_price * newItem.quantity * newItem.discount_percent) / 100;
    const subtotal = (newItem.unit_price * newItem.quantity) - discountAmount;

    const item = {
      id: Date.now().toString(),
      product_id: newItem.product_id,
      product_name: product.name,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      discount_percent: newItem.discount_percent,
      discount_amount: discountAmount,
      subtotal: subtotal
    };

    setItems([...items, item]);
    setNewItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0
    });
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = items.reduce((sum, item) => sum + item.discount_amount, 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const total = subtotal + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm vào báo giá');
      return;
    }

    const totals = calculateTotals();
    const quoteData = {
      ...formData,
      tax_rate: formData.tax_rate / 100,
      ...totals
    };

    try {
      let quoteId;

      if (quote) {
        await quotesAPI.update(quote.id, quoteData);
        quoteId = quote.id;
      } else {
        const response = await quotesAPI.create(quoteData);
        quoteId = response.data.id;
      }

      // Add items
      for (const item of items) {
        if (!item.existingItem) {
          await quotesAPI.addItem(quoteId, item);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Lỗi khi lưu báo giá: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totals = calculateTotals();

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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '1200px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">{quote ? 'Chi tiết báo giá' : 'Tạo báo giá mới'}</h3>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Thông tin khách hàng */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--sand)', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Thông tin khách hàng</h4>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Khách hàng *</label>
                <select
                  className="form-select"
                  value={formData.customer_id}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hiệu lực đến</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thuế VAT (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="2"
                placeholder="Ghi chú về báo giá..."
              />
            </div>
          </div>

          {/* Thêm sản phẩm */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--pink-light)', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Thêm sản phẩm</h4>
            <div className="grid grid-4">
              <div className="form-group">
                <label className="form-label">Sản phẩm</label>
                <select
                  className="form-select"
                  value={newItem.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.base_price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giảm giá (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.discount_percent}
                  onChange={(e) => setNewItem({ ...newItem, discount_percent: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddItem}
              disabled={!newItem.product_id}
            >
              <Plus size={18} />
              Thêm vào báo giá
            </button>
          </div>

          {/* Danh sách sản phẩm */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Danh sách sản phẩm ({items.length})</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Giảm giá</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{item.discount_percent}%</td>
                    <td><strong style={{ color: 'var(--green-primary)' }}>{formatCurrency(item.subtotal)}</strong></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '0.5rem', borderColor: 'var(--pink-rose)', color: 'var(--pink-rose)' }}
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Chưa có sản phẩm nào. Hãy thêm sản phẩm vào báo giá!
              </div>
            )}
          </div>

          {/* Tổng kết */}
          {items.length > 0 && (
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--cream)', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tạm tính:</span>
                <strong>{formatCurrency(totals.subtotal)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--pink-rose)' }}>
                <span>Giảm giá:</span>
                <strong>-{formatCurrency(totals.discountAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>VAT ({formData.tax_rate}%):</span>
                <strong>{formatCurrency(totals.taxAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid var(--earth-primary)', fontSize: '1.2rem' }}>
                <span><strong>Tổng cộng:</strong></span>
                <strong style={{ color: 'var(--green-primary)' }}>{formatCurrency(totals.total)}</strong>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {quote ? 'Cập nhật báo giá' : 'Tạo báo giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuoteForm;
