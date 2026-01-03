import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Link as LinkIcon } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductForm from '../components/ProductForm';
import VariantManager from '../components/VariantManager';
import PriceManager from '../components/PriceManager';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showPrices, setShowPrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Quản lý Sản phẩm</h2>
          <p className="page-description">Quản lý sản phẩm, biến thể và giá động</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }}
        >
          <Plus size={20} />
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Mã SKU</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá cơ bản</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.sku}</strong></td>
                <td>{product.name}</td>
                <td>
                  <span className="badge badge-info">{product.category}</span>
                </td>
                <td><strong style={{ color: 'var(--green-primary)' }}>{formatCurrency(product.base_price)}</strong></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowVariants(true);
                      }}
                      title="Quản lý biến thể"
                    >
                      <Package size={16} />
                      Biến thể
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowPrices(true);
                      }}
                      title="Quản lý giá"
                    >
                      <DollarSign size={16} />
                      Giá
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowForm(true);
                      }}
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem', borderColor: 'var(--pink-rose)', color: 'var(--pink-rose)' }}
                      onClick={() => handleDelete(product.id)}
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

        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Chưa có sản phẩm nào. Hãy thêm sản phẩm mới!
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          onSave={() => {
            loadProducts();
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showVariants && selectedProduct && (
        <VariantManager
          product={selectedProduct}
          onClose={() => {
            setShowVariants(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showPrices && selectedProduct && (
        <PriceManager
          product={selectedProduct}
          onClose={() => {
            setShowPrices(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default ProductsPage;
