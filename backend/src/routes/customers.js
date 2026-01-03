import express from 'express';
import { CustomerModel } from '../models/Customer.js';

const router = express.Router();

// Lấy tất cả khách hàng
router.get('/', (req, res) => {
  try {
    const customers = CustomerModel.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tìm kiếm khách hàng
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    const customers = CustomerModel.search(q);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy khách hàng theo ID
router.get('/:id', (req, res) => {
  try {
    const customer = CustomerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo khách hàng mới
router.post('/', (req, res) => {
  try {
    const customer = CustomerModel.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật khách hàng
router.put('/:id', (req, res) => {
  try {
    const customer = CustomerModel.update(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa khách hàng
router.delete('/:id', (req, res) => {
  try {
    CustomerModel.delete(req.params.id);
    res.json({ message: 'Đã xóa khách hàng thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
