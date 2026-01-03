import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { productsAPI } from '../services/api';

function VariantManager({ product, onClose }) {
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    variant_type: 'size',
    variant_name: '',
    variant_value: '',
    price_modifier: 0,
    stock_quantity: 0
  });

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    try {
      const response = await productsAPI.getVariants(product.id);
      setVariants(response.data);
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.createVariant(product.id, newVariant);
      loadVariants();
      setNewVariant({
        variant_type: 'size',
        variant_name: '',
        variant_value: '',
        price_modifier: 0,
        stock_quantity: 0
      });
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Lỗi khi thêm biến thể: ' + error.message);
    }
  };

  const handleDelete = async (variantId) => {
    if (window.confirm('Bạn có chắc muốn xóa biến thể này?')) {
      try {
        await productsAPI.deleteVariant(product.id, variantId);
        loadVariants();
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getVariantTypeLabel = (type) => {
    const labels = {
      size: 'Kích thước',
      stage: 'Giai đoạn',
      pack: 'Đóng gói'
    };
    return labels[type] || type;
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
      <div className="card" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Quản lý biến thể: {product.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Thêm các biến thể như kích thước, giai đoạn chín, cách đóng gói...
            </p>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAddVariant} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--sand)', borderRadius: 'var(--border-radius)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Thêm biến thể mới</h4>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Loại biến thể</label>
              <select
                className="form-select"
                value={newVariant.variant_type}
                onChange={(e) => setNewVariant({ ...newVariant, variant_type: e.target.value })}
              >
                <option value="size">Kích thước</option>
                <option value="stage">Giai đoạn</option>
                <option value="pack">Đóng gói</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tên biến thể</label>
              <input
                type="text"
                className="form-input"
                value={newVariant.variant_name}
                onChange={(e) => setNewVariant({ ...newVariant, variant_name: e.target.value })}
                placeholder="VD: Kích thước"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá trị</label>
              <input
                type="text"
                className="form-input"
                value={newVariant.variant_value}
                onChange={(e) => setNewVariant({ ...newVariant, variant_value: e.target.value })}
                placeholder="VD: Lớn (2-4 trái/kg)"
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Điều chỉnh giá (VNĐ)</label>
              <input
                type="number"
                className="form-input"
                value={newVariant.price_modifier}
                onChange={(e) => setNewVariant({ ...newVariant, price_modifier: parseFloat(e.target.value) })}
                placeholder="0"
              />
              <small style={{ color: 'var(--text-secondary)' }}>Số dương tăng giá, số âm giảm giá</small>
            </div>

            <div className="form-group">
              <label className="form-label">Số lượng tồn kho</label>
              <input
                type="number"
                className="form-input"
                value={newVariant.stock_quantity}
                onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Plus size={18} />
            Thêm biến thể
          </button>
        </form>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>
            Danh sách biến thể ({variants.length})
          </h4>
          <table className="table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Tên</th>
                <th>Giá trị</th>
                <th>Điều chỉnh giá</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>
                    <span className="badge badge-info">{getVariantTypeLabel(variant.variant_type)}</span>
                  </td>
                  <td>{variant.variant_name}</td>
                  <td>{variant.variant_value}</td>
                  <td>
                    <span style={{ color: variant.price_modifier >= 0 ? 'var(--green-primary)' : 'var(--pink-rose)' }}>
                      {variant.price_modifier >= 0 ? '+' : ''}{formatCurrency(variant.price_modifier)}
                    </span>
                  </td>
                  <td>{variant.stock_quantity}</td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem', borderColor: 'var(--pink-rose)', color: 'var(--pink-rose)' }}
                      onClick={() => handleDelete(variant.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {variants.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Chưa có biến thể nào. Hãy thêm biến thể mới!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VariantManager;
