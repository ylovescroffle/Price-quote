import db from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export class DynamicPriceModel {
  static getByProduct(productId) {
    const stmt = db.prepare(
      'SELECT * FROM dynamic_prices WHERE product_id = ? AND is_active = 1 ORDER BY created_at DESC'
    );
    return stmt.all(productId);
  }

  static getActive(productId, variantId = null) {
    let stmt;
    if (variantId) {
      stmt = db.prepare(
        'SELECT * FROM dynamic_prices WHERE product_id = ? AND variant_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
      );
      return stmt.get(productId, variantId);
    } else {
      stmt = db.prepare(
        'SELECT * FROM dynamic_prices WHERE product_id = ? AND variant_id IS NULL AND is_active = 1 ORDER BY created_at DESC LIMIT 1'
      );
      return stmt.get(productId);
    }
  }

  static create(data) {
    const id = uuidv4();
    const stmt = db.prepare(
      `INSERT INTO dynamic_prices
       (id, product_id, variant_id, price, source, source_url, crawled_at, is_active, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      data.product_id,
      data.variant_id || null,
      data.price,
      data.source,
      data.source_url || null,
      data.crawled_at || null,
      data.is_active !== undefined ? data.is_active : 1,
      data.notes || null
    );

    return this.getById(id);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM dynamic_prices WHERE id = ?');
    return stmt.get(id);
  }

  static deactivateOld(productId, variantId = null) {
    let stmt;
    if (variantId) {
      stmt = db.prepare(
        'UPDATE dynamic_prices SET is_active = 0 WHERE product_id = ? AND variant_id = ?'
      );
      return stmt.run(productId, variantId);
    } else {
      stmt = db.prepare(
        'UPDATE dynamic_prices SET is_active = 0 WHERE product_id = ? AND variant_id IS NULL'
      );
      return stmt.run(productId);
    }
  }

  static getHistory(productId, limit = 10) {
    const stmt = db.prepare(
      'SELECT * FROM dynamic_prices WHERE product_id = ? ORDER BY created_at DESC LIMIT ?'
    );
    return stmt.all(productId, limit);
  }
}
