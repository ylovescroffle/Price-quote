import axios from 'axios';
import * as cheerio from 'cheerio';
import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { DynamicPriceModel } from '../models/DynamicPrice.js';

export class PriceCrawler {
  static async crawlShopeePrice(url, productId) {
    const history = {
      id: uuidv4(),
      product_id: productId,
      source: 'shopee',
      source_url: url,
      price_found: null,
      status: 'failed',
      error_message: null,
      crawled_at: new Date().toISOString()
    };

    try {
      // Gửi request với headers giả lập browser
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Thử các selector khác nhau để tìm giá
      let price = null;
      const selectors = [
        '.pqTWkA', // Shopee price class
        '[class*="price"]',
        '[data-testid="price"]',
        '.product-price',
        'span[class*="Price"]'
      ];

      for (const selector of selectors) {
        const priceText = $(selector).first().text();
        if (priceText) {
          // Loại bỏ ký tự không phải số
          const cleanPrice = priceText.replace(/[^\d]/g, '');
          if (cleanPrice) {
            price = parseInt(cleanPrice);
            break;
          }
        }
      }

      if (price) {
        history.price_found = price;
        history.status = 'success';

        // Lưu giá mới vào database
        await DynamicPriceModel.create({
          product_id: productId,
          price: price,
          source: 'shopee',
          source_url: url,
          crawled_at: new Date().toISOString(),
          is_active: 1,
          notes: 'Tự động thu thập từ Shopee'
        });
      } else {
        history.status = 'no_price';
        history.error_message = 'Không tìm thấy giá trên trang';
      }
    } catch (error) {
      history.status = 'failed';
      history.error_message = error.message;
    }

    // Lưu lịch sử crawl
    this.saveHistory(history);

    return history;
  }

  static async crawlGenericPrice(url, productId, priceSelector = null) {
    const history = {
      id: uuidv4(),
      product_id: productId,
      source: 'generic',
      source_url: url,
      price_found: null,
      status: 'failed',
      error_message: null,
      crawled_at: new Date().toISOString()
    };

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      let price = null;

      if (priceSelector) {
        const priceText = $(priceSelector).first().text();
        const cleanPrice = priceText.replace(/[^\d]/g, '');
        if (cleanPrice) {
          price = parseInt(cleanPrice);
        }
      } else {
        // Tìm kiếm tự động
        const selectors = [
          '[class*="price"]',
          '[data-price]',
          '.product-price',
          '.price',
          'span[itemprop="price"]'
        ];

        for (const selector of selectors) {
          const priceText = $(selector).first().text();
          if (priceText) {
            const cleanPrice = priceText.replace(/[^\d]/g, '');
            if (cleanPrice) {
              price = parseInt(cleanPrice);
              break;
            }
          }
        }
      }

      if (price) {
        history.price_found = price;
        history.status = 'success';

        await DynamicPriceModel.create({
          product_id: productId,
          price: price,
          source: 'web',
          source_url: url,
          crawled_at: new Date().toISOString(),
          is_active: 1,
          notes: 'Tự động thu thập từ web'
        });
      } else {
        history.status = 'no_price';
        history.error_message = 'Không tìm thấy giá';
      }
    } catch (error) {
      history.status = 'failed';
      history.error_message = error.message;
    }

    this.saveHistory(history);
    return history;
  }

  static saveHistory(history) {
    const stmt = db.prepare(
      `INSERT INTO price_crawl_history
       (id, product_id, source, source_url, price_found, status, error_message, crawled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      history.id,
      history.product_id,
      history.source,
      history.source_url,
      history.price_found,
      history.status,
      history.error_message,
      history.crawled_at
    );
  }

  static getHistory(productId, limit = 20) {
    const stmt = db.prepare(
      'SELECT * FROM price_crawl_history WHERE product_id = ? ORDER BY crawled_at DESC LIMIT ?'
    );
    return stmt.all(productId, limit);
  }
}
