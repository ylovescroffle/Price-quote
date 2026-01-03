import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, FileText } from 'lucide-react';
import { quotesAPI } from '../services/api';
import QuoteForm from '../components/QuoteForm';

function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadQuotes();
  }, [filterStatus]);

  const loadQuotes = async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const response = await quotesAPI.getAll(params);
      setQuotes(response.data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa báo giá này?')) {
      try {
        await quotesAPI.delete(id);
        loadQuotes();
      } catch (error) {
        console.error('Error deleting quote:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await quotesAPI.updateStatus(id, newStatus);
      loadQuotes();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: { text: 'Nháp', class: 'badge-info' },
      pending: { text: 'Chờ duyệt', class: 'badge-warning' },
      approved: { text: 'Đã duyệt', class: 'badge-success' },
      sent: { text: 'Đã gửi', class: 'badge-info' },
      accepted: { text: 'Đã chấp nhận', class: 'badge-success' },
      rejected: { text: 'Từ chối', class: 'badge-warning' },
      expired: { text: 'Hết hạn', class: 'badge-warning' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'badge-info' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Quản lý Báo giá</h2>
          <p className="page-description">Tạo và quản lý báo giá cho khách hàng</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedQuote(null);
            setShowForm(true);
          }}
        >
          <Plus size={20} />
          Tạo báo giá mới
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '500' }}>Lọc theo trạng thái:</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="all">Tất cả</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="sent">Đã gửi</option>
            <option value="accepted">Đã chấp nhận</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Số báo giá</th>
              <th>Khách hàng</th>
              <th>Ngày tạo</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td><strong>{quote.quote_number}</strong></td>
                <td>{quote.customer_name}</td>
                <td>{formatDate(quote.created_at)}</td>
                <td><strong style={{ color: 'var(--green-primary)' }}>{formatCurrency(quote.total)}</strong></td>
                <td>{getStatusBadge(quote.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem' }}
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowForm(true);
                      }}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                      Xem
                    </button>
                    <select
                      className="form-select"
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      style={{ width: 'auto', padding: '0.5rem' }}
                    >
                      <option value="draft">Nháp</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="sent">Đã gửi</option>
                      <option value="accepted">Đã chấp nhận</option>
                      <option value="rejected">Từ chối</option>
                    </select>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem', borderColor: 'var(--pink-rose)', color: 'var(--pink-rose)' }}
                      onClick={() => handleDelete(quote.id)}
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

        {quotes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Chưa có báo giá nào. Hãy tạo báo giá mới!
          </div>
        )}
      </div>

      {showForm && (
        <QuoteForm
          quote={selectedQuote}
          onClose={() => {
            setShowForm(false);
            setSelectedQuote(null);
          }}
          onSave={() => {
            loadQuotes();
            setShowForm(false);
            setSelectedQuote(null);
          }}
        />
      )}
    </div>
  );
}

export default QuotesPage;
