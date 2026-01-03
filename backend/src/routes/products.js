import express from 'express';
import { ProductModel } from '../models/Product.js';
import { ProductVariantModel } from '../models/ProductVariant.js';
import { DynamicPriceModel } from '../models/DynamicPrice.js';
import { PriceCrawler } from '../services/priceCrawler.js';

const router = express.Router();

// Lấy tất cả sản phẩm
router.get('/', (req, res) => {
  try {
    const products = ProductModel.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tìm kiếm sản phẩm
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    const products = ProductModel.search(q);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy sản phẩm theo ID (kèm variants và prices)
router.get('/:id', (req, res) => {
  try {
    const product = ProductModel.getWithVariants(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tạo sản phẩm mới
router.post('/', (req, res) => {
  try {
    const product = ProductModel.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật sản phẩm
router.put('/:id', (req, res) => {
  try {
    const product = ProductModel.update(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa sản phẩm
router.delete('/:id', (req, res) => {
  try {
    ProductModel.delete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý biến thể sản phẩm
router.get('/:id/variants', (req, res) => {
  try {
    const variants = ProductVariantModel.getByProduct(req.params.id);
    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/variants', (req, res) => {
  try {
    const variant = ProductVariantModel.create({
      ...req.body,
      product_id: req.params.id
    });
    res.status(201).json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/variants/:variantId', (req, res) => {
  try {
    const variant = ProductVariantModel.update(req.params.variantId, req.body);
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/variants/:variantId', (req, res) => {
  try {
    ProductVariantModel.delete(req.params.variantId);
    res.json({ message: 'Đã xóa biến thể thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quản lý giá động
router.get('/:id/prices', (req, res) => {
  try {
    const prices = DynamicPriceModel.getByProduct(req.params.id);
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/prices', (req, res) => {
  try {
    const price = DynamicPriceModel.create({
      ...req.body,
      product_id: req.params.id
    });
    res.status(201).json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thu thập giá từ web
router.post('/:id/crawl-price', async (req, res) => {
  try {
    const { url, source = 'generic', selector } = req.body;

    let result;
    if (source === 'shopee') {
      result = await PriceCrawler.crawlShopeePrice(url, req.params.id);
    } else {
      result = await PriceCrawler.crawlGenericPrice(url, req.params.id, selector);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lịch sử thu thập giá
router.get('/:id/price-history', (req, res) => {
  try {
    const history = PriceCrawler.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
