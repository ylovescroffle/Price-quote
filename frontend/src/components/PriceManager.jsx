import { useState, useEffect } from 'react';
import { X, Plus, Globe, RefreshCw } from 'lucide-react';
import { productsAPI } from '../services/api';

function PriceManager({ product, onClose }) {
  const [prices, setPrices] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlSource, setCrawlSource] = useState('shopee');
  const [crawling, setCrawling] = useState(false);
  const [manualPrice, setManualPrice] = useState({
    price: 0,
    source: 'manual',
    notes: ''
  });

  useEffect(() => {
    loadPrices();
    loadPriceHistory();
  }, []);

  const loadPrices = async () => {
    try {
      const response = await productsAPI.getPrices(product.id);
      setPrices(response.data);
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const response = await productsAPI.getPriceHistory(product.id);
      setPriceHistory(response.data);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const handleCrawlPrice = async (e) => {
    e.preventDefault();
    if (!crawlUrl) return;

    setCrawling(true);
    try {
      const response = await productsAPI.crawlPrice(product.id, crawlUrl, crawlSource);

      if (response.data.status === 'success') {
        alert(`✓ Thu thập giá thành công: ${formatCurrency(response.data.price_found)}`);
        loadPrices();
        loadPriceHistory();
        setCrawlUrl('');
      } else {
        alert('❌ Không thể thu thập giá: ' + (response.data.error_message || 'Không tìm thấy giá'));
      }
    } catch (error) {
      console.error('Error crawling price:', error);
      alert('Lỗi khi thu thập giá: ' + error.message);
    } finally {
      setCrawling(false);
    }
  };

  const handleAddManualPrice = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.createPrice(product.id, {
        ...manualPrice,
        is_active: 1
      });
      loadPrices();
      loadPriceHistory();
      setManualPrice({ price: 0, source: 'manual', notes: '' });
    } catch (error) {
      console.error('Error adding manual price:', error);
      alert('Lỗi khi thêm giá: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getSourceBadge = (source) => {
    const sourceMap = {
      shopee: { text: 'Shopee', class: 'badge-warning' },
      manual: { text: 'Thủ công', class: 'badge-info' },
      web: { text: 'Web', class: 'badge-success' },
      competitor: { text: 'Đối thủ', class: 'badge-info' }
    };

    const sourceInfo = sourceMap[source] || { text: source, class: 'badge-info' };
    return <span className={`badge ${sourceInfo.class}`}>{sourceInfo.text}</span>;
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
      <div className="card" style={{ maxWidth: '1000px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">Quản lý giá: {product.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Thu thập giá từ web hoặc nhập giá thủ công
            </p>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          {/* Thu thập giá từ web */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--pink-light)', borderRadius: 'var(--border-radius)' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} />
              Thu thập giá từ web
            </h4>
            <form onSubmit={handleCrawlPrice}>
              <div className="form-group">
                <label className="form-label">Nguồn</label>
                <select
                  className="form-select"
                  value={crawlSource}
                  onChange={(e) => setCrawlSource(e.target.value)}
                >
                  <option value="shopee">Shopee</option>
                  <option value="generic">Website khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">URL sản phẩm</label>
                <input
                  type="url"
                  className="form-input"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  placeholder="https://shopee.vn/..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={crawling}
                style={{ width: '100%' }}
              >
                {crawling ? (
                  <>
                    <RefreshCw size={18} className="spinning" />
                    Đang thu thập...
                  </>
                ) : (
                  <>
                    <Globe size={18} />
                    Thu thập giá
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Nhập giá thủ công */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--sand)', borderRadius: 'var(--border-radius)' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Nhập giá thủ công</h4>
            <form onSubmit={handleAddManualPrice}>
              <div className="form-group">
                <label className="form-label">Nguồn</label>
                <select
                  className="form-select"
                  value={manualPrice.source}
                  onChange={(e) => setManualPrice({ ...manualPrice, source: e.target.value })}
                >
                  <option value="manual">Thủ công</option>
                  <option value="competitor">Đối thủ</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Giá (VNĐ)</label>
                <input
                  type="number"
                  className="form-input"
                  value={manualPrice.price}
                  onChange={(e) => setManualPrice({ ...manualPrice, price: parseFloat(e.target.value) })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <input
                  type="text"
                  className="form-input"
                  value={manualPrice.notes}
                  onChange={(e) => setManualPrice({ ...manualPrice, notes: e.target.value })}
                  placeholder="VD: Giá tại chợ đầu mối"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} />
                Thêm giá
              </button>
            </form>
          </div>
        </div>

        {/* Giá hiện tại */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Giá hiện tại</h4>
          {prices.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Nguồn</th>
                  <th>Giá</th>
                  <th>Thời gian</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.id}>
                    <td>{getSourceBadge(price.source)}</td>
                    <td><strong style={{ color: 'var(--green-primary)', fontSize: '1.1rem' }}>{formatCurrency(price.price)}</strong></td>
                    <td>{formatDate(price.created_at)}</td>
                    <td>{price.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', backgroundColor: 'var(--cream)', borderRadius: 'var(--border-radius)' }}>
              Chưa có giá nào được thiết lập
            </div>
          )}
        </div>

        {/* Lịch sử thu thập */}
        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--earth-dark)' }}>Lịch sử thu thập ({priceHistory.length})</h4>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Nguồn</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map((history) => (
                  <tr key={history.id}>
                    <td>{formatDate(history.crawled_at)}</td>
                    <td>
                      <small style={{ color: 'var(--text-secondary)' }}>{history.source}</small>
                    </td>
                    <td>
                      {history.price_found ? (
                        <strong style={{ color: 'var(--green-primary)' }}>{formatCurrency(history.price_found)}</strong>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {history.status === 'success' ? (
                        <span className="badge badge-success">Thành công</span>
                      ) : (
                        <span className="badge badge-warning" title={history.error_message}>
                          {history.status === 'no_price' ? 'Không tìm thấy' : 'Lỗi'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PriceManager;
