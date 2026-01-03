import express from 'express';
import { QuoteModel } from '../models/Quote.js';

const router = express.Router();

// Lấy tất cả báo giá
router.get('/', (req, res) => {
  try {
    const { status, customer_id } = req.query;

    let quotes;
    if (status) {
      quotes = QuoteModel.getByStatus(status);
    } else if (customer_id) {
      quotes = QuoteModel.getByCustomer(customer_id);
    } else {
      quotes = QuoteModel.getAll();
    }

    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy báo giá theo ID
router.get('/:id', (req, res) => {
  try {
    const quote = QuoteModel.getById(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Không tìm thấy báo giá' });
    }
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo báo giá mới
router.post('/', (req, res) => {
  try {
    const quote = QuoteModel.create(req.body);
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật báo giá
router.put('/:id', (req, res) => {
  try {
    const quote = QuoteModel.update(req.params.id, req.body);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái báo giá
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const quote = QuoteModel.updateStatus(req.params.id, status);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa báo giá
router.delete('/:id', (req, res) => {
  try {
    QuoteModel.delete(req.params.id);
    res.json({ message: 'Đã xóa báo giá thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm sản phẩm vào báo giá
router.post('/:id/items', (req, res) => {
  try {
    const itemId = QuoteModel.addItem(req.params.id, req.body);
    const quote = QuoteModel.recalculate(req.params.id);
    res.status(201).json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm khỏi báo giá
router.delete('/:id/items/:itemId', (req, res) => {
  try {
    QuoteModel.removeItem(req.params.itemId);
    const quote = QuoteModel.recalculate(req.params.id);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tính toán lại báo giá
router.post('/:id/recalculate', (req, res) => {
  try {
    const quote = QuoteModel.recalculate(req.params.id);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
